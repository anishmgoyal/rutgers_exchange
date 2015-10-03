class ApplicationService

	require 'thread'

	@@beans = Hash.new
	@@mutex = Mutex.new
	
	def self.set(service_name, service_class)
		@@mutex.synchronize do
			bean = service_class.new
			bean.init()
			@@beans[service_name] = bean
			puts "Set bean #{service_name} as #{service_class}"
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

end