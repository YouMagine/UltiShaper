class YoumagineController < ApplicationController
  def get_token
    logger.info "get token ===================="
    # @shapes = Shape.all


	# detect authorization
	# OK: window.postMessage()
    # Either redirect or post a message to the App.
    #
    # redirect_to "/app"
    if params[:authentication_token].nil?
	    logger.info "no token ===================="
	    respond_to do |format|
	      format.html {
	      	render :inline => "Cookies: <% cookies %>"
	      }
	      format.json { render :json => cookies }
	    end
	    return
	end

	################## SUCCESS ### GOT TOKEN ################
    cookies[:youmagine_user] = ActiveSupport::JSON.decode(params[:user])["slug"]
    cookies[:youmagine_screen_name] = ActiveSupport::JSON.decode(params[:user])["screen_name"]
    cookies[:youmagine_full_name] = ActiveSupport::JSON.decode(params[:user])["name"]
    cookies[:youmagine_user_id] = ActiveSupport::JSON.decode(params[:user])["slug"]
    cookies[:youmagine_user_data] = params[:user]
    cookies[:youmagine_token] = params[:authentication_token]

    respond_to do |format|
      format.html {

		render :inline => "Waiting for the UltiShaper to recieve the permission to access Youmagine on your behalf... this should take seconds, at most."
		# + params[:authentication_token]

      	# render :inline => "script: <script language=\"javascript\">window.postMessage('test','*');</script>
      	# Cookies: <% cookies %> Token <% " + params[:authentication_token] + " %>"

      }
      # format.json { render :json => cookies }
    end

  end

	def connect_success
	    respond_to do |format|
	      format.html {

			render :inline => "<html>
			<head>
			  <title>Connected this app to Youmagine succesfully!</title>
			  <style>body, p, h1{font-family: sans-serif;color: rgb(112, 112, 112)}</style>
			  <script>window.setTimeout(function(){window.close();},4000);</script>
			</head>
			  <body>
			    <center><h1>GREAT</h1><p><b>The UltiShaper has received your authentication! You can now close this popup window...
			    <br/><br/>(or wait 4 seconds for it to close)</b></p>
			    </center>
			  </body>
			</html>"
	      }
	    end
	end

end



#http://www.youmagine.com/integrations/ultishaper/authorized_integrations/new?authorized_integration[redirect_url]=http://localhost:3000/youmagine/get_token&authorized_integration[deny_url]=http://localhost:3000/youmagine/get_token
 
# function receiveMessage(event)
# {
# 	alert("message from "+ event.origin);
#   if (event.origin !== "http://example.org:8080")
#     return;
 
# }
# window.addEventListener("message", receiveMessage, false);
