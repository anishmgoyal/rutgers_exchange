class ServerConfigOption < ActiveRecord::Base

	def self.set_option(option, value)
		ServerConfigOption.where(config_name: option).delete_all
		sco = ServerConfigOption.new(config_name: option, value: value)
		sco.save()
	end

	def self.get_option(option)
		sco = ServerConfigOption.where(config_name: option).first
		if sco
			sco.value
		else
			nil
		end
	end

end
