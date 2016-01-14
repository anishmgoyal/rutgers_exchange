# Stores active notifications for sessions
class NotificationService

	require 'thread'

	def init
		@session_map = Hash.new
		@user_map = Hash.new
		@mutex = Mutex.new
	end

	def create_session(user_id, session_id, device_type)
		user_id = user_id.to_s
		session_id = session_id.to_s
		if device_type.to_sym == :WEB_SHORT_POLL
			@session_map[session_id] = {
				session_queue: Queue.new,
				num_actions: 0,
				age: 0,
				ticks_without_notif: 0,
				activity_level: 1,
				last_tick: 0,
				ticks: 0,
				lock: 0
			}
			user_sessions = @user_map[user_id]
			unless user_sessions
				user_sessions = Hash.new
				@user_map[user_id] = user_sessions
			end
			user_sessions[session_id] = session_id
		end
	end

	def delete_session(user_id, session_id)
		user_id = user_id.to_s
		session_id = session_id.to_s
		@mutex.synchronize do
			@session_map.delete session_id
			user_sessions = @user_map[user_id]
			user_sessions.delete session_id if user_sessions
			@user_map.delete user_id if user_sessions.size == 0
		end
	end

	def add_notification(user_id, notification_type, notification_value)
		user_id = user_id.to_s

		user_sessions = nil
		@mutex.synchronize do
			user_sessions = @user_map[user_id.to_s]
		end
		if user_sessions
			user_sessions.each do |session_id, ignored|
				session_queue = @session_map[session_id][:session_queue]
				session_queue << {type: notification_type, value: notification_value} if session_queue
			end
		end
	end

	def broadcast(notification_type, notification_value)
		@session_map.each do |session_id, session|
			session_queue = session[:session_queue]
			session_queue << {type: notification_type, value: notification_value, special: :BROADCAST} if session_queue
		end
	end

	def get_notifications(session_id, activity_level)
		session_id = session_id.to_s

		session = @session_map[session_id]

		# This session is dead
		if !session
			return {notifications: [], tick_delay: -1}
		end

		session_queue = session[:session_queue]

		ret = []
		if session[:lock] > Time.now.to_i
			{notifications: ret, tick_delay: Time.now.to_i - session[:lock] + 1}
		else

			num_broadcasts = 0

			if session_queue
				session_queue.size.times do
					next_notification = session_queue.pop(true)
					if next_notification[:special] == :BROADCAST
						num_broadcasts = num_broadcasts + 1
						next_notification.delete :special
					end
					ret << next_notification
				end
			end

			num_private_notifs = ret.size - num_broadcasts

			last_tick = session[:last_tick]
			session[:last_tick] = Time.now.to_i
			session[:num_actions] = session[:num_actions] + num_private_notifs
			session[:age] = session[:age] + (session[:last_tick] - last_tick)
			session[:activity_level] = activity_level
			session[:ticks_without_notif] = (num_private_notifs == 0)? session[:ticks_without_notif] + 1 : 0
			session[:ticks] = session[:ticks] + 1

			tick_delay = calculate_tick_time session

			{notifications: ret, tick_delay: tick_delay}
		end
	end

	def calculate_tick_time(session)
		num_sessions = ApplicationService.get(:SessionService).num_sessions
		session_density = session[:num_actions] / session[:age]
		ticks_without_notif = session[:ticks_without_notif]
		activity_level = session[:activity_level]
		tick_frequency = session[:ticks] / session[:age]
		incremental_tick_decay = 2

		proposed_tick_time = 2 + (incremental_tick_decay * (0.5 * ticks_without_notif) + (0.011 * num_sessions) - (10 * session_density))
		proposed_tick_time = [2, [proposed_tick_time, 30].min].max
		proposed_tick_time = proposed_tick_time + 10 if tick_frequency > 0.5
		session[:lock] = Time.now.to_i + 45 if tick_frequency > 1

		proposed_tick_time
	end

end