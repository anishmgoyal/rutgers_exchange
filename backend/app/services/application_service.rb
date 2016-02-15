class ApplicationService

	require 'thread'

	@@beans = Hash.new
	@@mutex = Mutex.new

	@@bayeux = nil
	
	def self.set(service_name, service_class)
		@@mutex.synchronize do
			bean = service_class.new
			bean.init()
			@@beans[service_name] = bean
			if @@bayeux
				begin
					bean.inject_sockets(@@bayeux)
				rescue
					# No websocket injector found
					# Do Nothing
				end
			end
			puts "Set bean #{service_name} as #{service_class}"
		end
	end

	def self.alias(service_original_name, service_name)
		@@mutex.synchronize do
			@@beans[service_name] = @@beans[service_original_name]
			puts "Alias #{service_original_name} as #{service_name}"
		end
	end
	
	def self.get(service_name)
		@@mutex.synchronize do
			@@beans[service_name]
		end
	end
	
	def self.reload(service_name)
	
		service = @@beans[service_name]
		service_class = service.class
	
		# Reload all services
		Dir[File.dirname(__FILE__) + '/*.rb'].each do |file|
			if file != File.basename(__FILE__)
				load file
				service_name_str = service_name.to_s
				service_name_str.downcase!.sub! "service", ""
				if file.include? service_name_str
					puts "Reloading #{file}"
				end
			end
		end

		if service_class
			bean = service_class.new
			bean.init()
			@@beans[service_name] = bean
			puts "Reloaded #{service_name} as #{service_class}"
			return true
		else
			return false
		end
	end

	def self.run_maintenance
		@@beans.each do |bean_name, bean|
			begin
				bean.run_maintenance
			rescue
				# No maintenance method for bean
				# Do nothing
			end
		end
	end

	def self.set_bayeux(bayeux)
		@@bayeux = bayeux
		@@beans.each do |bean_name, bean|
			begin
				bean.inject_sockets(@@bayeux)
			rescue
				# No inject method found
				# Do nothing
			end
		end
	end

	def self.get_bayeux
		@@bayeux
	end

end