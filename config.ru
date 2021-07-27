#

require 'webrick'

module WebrickOverrideOptions
  def default_options
    webrick_options = {
      :Port               => 8888,
      :environment        => (ENV['RACK_ENV'] || "development").dup,
      :Logger             => WEBrick::Log::new($stdout, WEBrick::Log::DEBUG),
      :MaxClients         => 32
    }

    super.merge webrick_options
  end
end

Rack::Server.send(:prepend, WebrickOverrideOptions)

public_urls = 
[
"/DragControls.js",
"/OrbitControls.js",
"/app.js",
"/favicon.ico",
"/index.html",
"/stats.module.js",
"/three.module.js",
"/shared/rendering.json"
]

use(
  Rack::Static, {
    :urls => public_urls,
    :root => 'public'
  }
)

class App
  def self.call(*args)
    return [301, {"Location" => "/index.html"}, [""]]
  end
end

@app = run(App)
