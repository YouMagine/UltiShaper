define (require)->
  Backbone = require 'backbone'
  LocalStorage = require 'localstorage'

  vent = require 'core/messaging/appVent'
  reqRes = require 'core/messaging/appReqRes'
  
  buildProperties = require 'core/utils/buildProperties'
  utils = require 'core/utils/utils'
  merge = utils.merge
  
  Project = require 'core/projects/project'
  
  class BrowserLibrary extends Backbone.Collection
    """
    a library contains multiple projects, stored in localstorage (browser)
    """  
    model: Project
    defaults:
      recentProjects: []
    
    constructor:(options)->
      super options
    
    comparator: (project)->
      date = new Date(project.lastModificationDate)
      return date.getTime()
      
  
  class YouMagineStore extends Backbone.Model
    attributeNames: ['name', 'loggedIn']
    buildProperties @
    
    idAttribute: 'name'
    defaults:
      name: "YouMagineStore"
      storeType: "YouMagine"
      tooltip:"Youmagine: Share your imagination"
      loggedIn: false
    token: null
    apiURL: "http://api.youmagine.com"
    checkForTokenPID: null
    checkForTokenTimes: 30
    checkForTokenTimesLeft: 30
    checkForTokenInterval: 1000
    designOnline: []

    
    constructor:(options)->
      defaults = {storeURI:"projects"}
      options = merge defaults, options
      {@storeURI} = options
      super options
        
      @store = new Backbone.LocalStorage(@storeURI)
      @isLogginRequired = true
      @vent = vent
      @vent.on("YouMagineStore:login", @login)
      @vent.on("YouMagineStore:logout", @logout)
      @vent.on("project:saved",@pushSavedProject)
      
      #experimental
      # @lib = new BrowserLibrary()
      # @lib.localStorage = new Backbone.LocalStorage(@storeURI)
      @projectsList = []
      
      #TODO: should this be here ? ie this preloads all projects, perhaps we could lazy load?
      # @lib.fetch()
      console.log "fetched lib", @lib
      
      #handler for project/file data fetch requests
      reqRes.addHandler("getbrowserFileOrProjectCode",@_sourceFetchHandler)
      
    login:=>
      console.log "youmagine logging in..."
      login_succeeded = false
      @authCheck()

      if @token isnt null
        console.log "There's a token cookie (#{@token}). Welcome #{@screen_name}!"
        console.log "does the token work?"
        @listDesigns()
      else
          @authRequestWindow=window.open('http://www.youmagine.com/integrations/ultishaper/authorized_integrations/new?redirect_url=http://localhost:3000/youmagine/get_token&deny_url=http://localhost:3000/youmagine/get_token','','width=450,height=500')
          @authRequestWindow.focus()
          window.clearInterval @checkForTokenPID 
          @checkForTokenPID = window.setInterval(@receiveTokenMessage, @checkForTokenInterval)
          console.log @checkForTokenPID

    authCheck:=>
      @token = $.cookie 'youmagine_token'
      @username = $.cookie 'youmagine_user'
      @user_id = $.cookie 'youmagine_user_id'
      @screen_name = $.cookie 'youmagine_screen_name'
      console.log "youmagine authCheck"
      if @token isnt null
        console.log "There's a token cookie (#{@token}). Welcome #{@screen_name}!"
        console.log "does the token work?"
        @listDesigns()

      # @loggedIn = true
      if @loggedIn != true
        console.log "youmagine login failed."
        
    setLoggedIn:=>
      @loggedIn = true
      window.clearInterval @checkForTokenPID
      @vent.trigger("YouMagineStore:loggedIn")

    logout:=>
      console.log "youmagine logging out..."
      $.cookie("youmagine_token",null);
      $.cookie("youmagine_user",null);
      $.cookie("youmagine_user_id",null);
      @loggedIn = false
      @vent.trigger("YouMagineStore:loggedOut")
      console.log "youmagine logged out"

    receiveTokenMessage:=>
      if --@checkForTokenTimesLeft <= 0
        console.log "I've been trying to connect to Youmagine for #{@checkForTokenTimes} seconds. Giving up."
        window.clearInterval @checkForTokenPID
        @checkForTokenTimesLeft = @checkForTokenTimes

      console.log "do I have a token???"
      @token = $.cookie 'youmagine_token'
      if @token is null
        console.log "token is null"
      else
        console.log "token recieved. Done."
        if typeof @authRequestWindow is "object" && @authRequestWindow.close
          @authRequestWindow.location.href = '/youmagine/connect_success';
        if @listDesigns() is false
          console.log "receiveTokenMessage(): Couldnt list designs. Cant use Youmagine."
        else @loggedIn = true
        window.clearInterval @checkForTokenPID


    listDesigns:=>
      console.log "listing your Designs on YouMagine from API #{@apiURL}"
      # Possibly, the following line is not needed:
      # jQuery.ajaxSetup {headers: {"X-Requested-With": "XMLHttpRequest"}}
      that = @
      req = $.getJSON "#{@apiURL}/designs.json", {auth_token:@token}, (data, resp) =>
        @listDesignsCallback data

        # @listDesignsCallback(data)
# `$.getJSON("#{@apiURL}/designs.json?auth_token=dYhhiT2h9ZSghBAYsb5C", function(data) { console.log(data); })`


    listDesignsCallback:(data)=>
      console.log "listDesignsCallback()"
      @designOnline = data
      console.log data
      if data.length
        @setLoggedIn()
      else
        if @loggedIn == false
          @authRequestWindow=window.open('http://www.youmagine.com/integrations/ultishaper/authorized_integrations/new?redirect_url=http://localhost:3000/youmagine/get_token&deny_url=http://localhost:3000/youmagine/get_token','','width=450,height=500')
          @authRequestWindow.focus()
          window.clearInterval @checkForTokenPID 
          @checkForTokenPID = window.setInterval(@receiveTokenMessage, @checkForTokenInterval)
          console.log @checkForTokenPID
    
    getProjectsName:(callback)=>
      try
        projectsList = localStorage.getItem("#{@storeURI}")
        console.log "browser store projects", projectsList,"storeURI", "#{@storeURI}"
        if projectsList
          projectsList = projectsList.split(',')
        else
          projectsList = []
        @projectsList = projectsList
        console.log "projectsList: =========",projectsList
        for design in @designOnline
          # console.log design.slug
          projectsList.unshift design.slug
        @_getAllProjectsHelper()
        #kept for now
        ### 
        projectNames = []
        for model in @lib.models
          projectNames.push(model.id)
          @projectsList.push(model.id) 
        ### 
        
        callback(@projectsList)
      catch error
        console.log "could not fetch projectsName from #{@name} because of error #{error}"
    
    getProject:(projectName)=>
      # return @lib.get(projectName)
    
    getProjectFiles:(projectName)=>
      #Get all the file names withing a project : should actually get the file tree? (subdirs support etc)
      d = $.Deferred()
      fileNames = []
      #project = @lib.get(projectName)
      if projectName in @projectsList
        fileNames = @_getProjectFiles(projectName)
        #projectURI = "#{@storeURI}-#{projectName}"
        #filesURI = "#{projectURI}-files"
        #project.rootFolder.sync = project.sync
        #project.rootFolder.changeStorage("localStorage",new Backbone.LocalStorage(filesURI))
        #fileNames = localStorage.getItem(filesURI)
        #files = fileNames.split(',')
      d.resolve(fileNames)
      return d
        
    saveProject_:(project, newName)=>
      project.collection = null
      @lib.add(project)
      if newName?
        project.name = newName
      projectURI = "#{@storeURI}-#{newName}"
      rootStoreURI = "#{projectURI}-files"
      project.rootFolder.changeStorage("localStorage",new Backbone.LocalStorage(rootStoreURI))
      project.save()
      @vent.trigger("project:saved")  
    
    saveProject:(project,newName)=>
      #experiment of saving projects withouth using backbone localstorage
      project.collection = null
      # @lib.add(project)
      
      nameChange = false
      if project.name != newName
        nameChange = true
        
      if newName?
        project.name = newName
        
      firstSave = false
      if not project.dataStore?
        firstSave = true
      else if project.dataStore != @ or nameChange
        firstSave = true
      project.dataStore = @
      
      projectName = project.name 
      @_addToProjectsList(project.name)
      
      projectURI = "#{@storeURI}-#{projectName}"
      rootStoreURI = "#{projectURI}-files"
       
      filesList = []
      for index, file of project.rootFolder.models
        name = file.name
        content =file.content
        filePath = "#{rootStoreURI}-#{name}"
        ext = name.split('.').pop()
        localStorage.setItem(filePath,JSON.stringify(file.toJSON()))
        filesList.push(file.name)
        file.trigger("save")
      
      #fetch old list of files, for diff, delete old file if not present anymore
      oldFiles = localStorage.getItem(rootStoreURI)
      if oldFiles?
        oldFiles = oldFiles.split(',')
        added = _.difference(filesList,oldFiles)
        removed = _.difference(oldFiles,filesList)
        @_removeFile(projectName, fileName) for fileName in removed
      
      localStorage.setItem(rootStoreURI,filesList.join(","))
      
      attributes = _.clone(project.attributes)
      for attrName, attrValue of attributes
        if attrName not in project.persistedAttributeNames
          delete attributes[attrName]
      strinfigiedProject = JSON.stringify(attributes)
      
      localStorage.setItem(projectURI,strinfigiedProject)
      
      # @vent.trigger("project:saved",project)
      if firstSave
        project._clearFlags()
      project.trigger("save", project)
      @vent.trigger("project:saved",project)
      
    pushSavedProject:(project)=>
      # New function that's run after a save. Responds to project:saved
      console.log 'going to push project to youmagine.',project
      # jQuery.ajaxSetup({async:false});
      window.apiURL = @apiURL
      url = "#{window.apiURL}/designs.json?auth_token=#{@token}"
      url = "#{@apiURL}/designs/60.json?auth_token=#{@token}"
      # url = "#{@apiURL}/designs.json"
      # console.log "url = #{url}"
      window.auth_token = @token
      data =
        'design[name]': project.name
        'design[description]': 'Made with the <b>Ultishaper</b>!!'
        'design[license]': 'cc'

      filesList = project.rootFolder.models
      # use PUT for 're-saving'
      # use POST for 'adding a resource'

      type = 'PUT'
      req = $.ajax url, 
        data: data
        type: type
        success: (data, resp,jqXHRObj) ->
          console.log "#Response: #{resp} !!!!!!",data,jqXHRObj
          # if data.id?
          for index, file of filesList
            fileName = file.id
            fileContent = file.content
            ext = fileName.split('.').pop().toLowerCase()
            if ext isnt 'ultishape' && ext isnt 'png'
              console.log 'Phase 2: NOT UPLOADING:',fileName
            else
              console.log 'Phase 2: UPLOADING:',fileName
              dataB64 = []
              i = -1;


              console.log 'fileContent is a ' + typeof fileContent,'Content:',fileContent.substring(0,30)

              if ext is 'ultishape'
                while ( i++ < fileContent.length)
                  dataB64.push(fileContent.charAt(i))
                aBlob = new Blob(dataB64, {
                  type: 'application/xml'
                });
                entityType = 'documents'
                fd = new FormData
                fd.append('document[name]', fileName);
                # fd.append('document[filename]', fileName);
                fd.append('document[description]', 'The main UltiShaper design file.');
                fd.append('document[file]', aBlob,fileName);


              if ext is 'png'
                console.log 'b64toBlob'
                aBlob = b64toBlob(fileContent.substring(22,fileContent.length),'image/png');
                console.log {txt:'b64toBlob result:',result:aBlob}
                entityType = 'images'
                fd = new FormData
                fd.append('image[name]', fileName);
                fd.append('image[description]', 'Design made with the UltiShaper.');
                fd.append('image[file]', aBlob,fileName);

              url = "http://api.youmagine.com/designs/60/" + entityType + ".json?auth_token=#{window.auth_token}"
              console.log "Posting to ",url
              $.ajax url,
                type: 'POST'
                data: fd
                processData: false
                contentType: false
                cache: false
                done: ->
                  console.log 'FormData post: ',data
                error:(a,b,c) ->
                  console.log 'failed: ',a,b,c,a.responseText
    
    autoSaveProject:(srcProject)=>
      #used for autoSaving projects
      srcProjectName = srcProject.name
      
      fakeClone =(project,newName)=>
        clonedProject = new Project({name:newName})
        for pfile in project.rootFolder.models
          clonedProject.addFile
            name:pfile.name
            content:pfile.content
        return clonedProject
        
      projectName = "autosave"#srcProjectName+"_auto" 
      project = fakeClone(srcProject,projectName)
      @lib.add(project)
      @_addToProjectsList(projectName)
      
      projectURI = "#{@storeURI}-#{projectName}"
      rootStoreURI = "#{projectURI}-files"
       
      filesList = []
      for index, file of project.rootFolder.models
        name = file.name
        content =file.content
        filePath = "#{rootStoreURI}-#{name}"
        ext = name.split('.').pop()
        localStorage.setItem(filePath,JSON.stringify(file.toJSON()))
        filesList.push(file.name)
        file.trigger("save")
      
      localStorage.setItem(rootStoreURI,filesList.join(","))
      
      attributes = _.clone(project.attributes)
      for attrName, attrValue of attributes
        if attrName not in project.persistedAttributeNames
          delete attributes[attrName]
      strinfigiedProject = JSON.stringify(attributes)
      
      localStorage.setItem(projectURI,strinfigiedProject)
      
      
      @vent.trigger("project:autoSaved")  
    
    loadProject:(projectName, silent=false)=>
      d = $.Deferred()
      project =  new Project
        name : projectName #@lib.get(projectName)
      project.collection = @lib
      projectURI = "#{@storeURI}-#{projectName}"
      rootStoreURI = "#{projectURI}-files"
      project.rootFolder.sync = project.sync
      project.rootFolder.changeStorage("localStorage",new Backbone.LocalStorage(rootStoreURI))
      
      onProjectLoaded=()=>
        #remove old thumbnail
        thumbNailFile = project.rootFolder.get(".thumbnail.png")
        if thumbNailFile?
          project.rootFolder.remove(thumbNailFile)
        project._clearFlags()
        project.trigger("loaded")
        #project.rootFolder.trigger("reset")
        if not silent
          @vent.trigger("project:loaded",project)
        
        d.resolve(project)
      
      project.dataStore = @
      
      fileNames = @_getProjectFiles(projectName)
      for fileName in fileNames
        console.log fileName,' is being filtered ==++++++++++=='
        content = @_readFile(projectName,fileName)
        if fileName.substr(0,7) is 'http://' || fileName.substr(0,8) is 'https://'
          console.log fileName,'before'
          fileName = fileName.split('/')[fileName.split('/').length-1]
          console.log fileName,'after'
        project.addFile
          content : content
          name : fileName
      onProjectLoaded()
      #project.rootFolder.fetch().done(onProjectLoaded)
      return d
   
    deleteProject:(projectName)=>
      d = $.Deferred()
      console.log "browser storage deletion of #{projectName}"
      project = @lib.get(projectName)
      
      projectURI = "#{@storeURI}-#{projectName}"
      rootStoreURI = "#{projectURI}-files"
      
      file = null
      filesURI = "#{projectURI}-files"
      console.log "filesURI #{filesURI}"
      fileNames = localStorage.getItem(filesURI)
      console.log "fileNames #{fileNames}"
      if fileNames
        fileNames = fileNames.split(',')
        for fileName in fileNames 
          fileUri = "#{rootStoreURI}-#{fileName}"
          console.log "deleting #{fileUri}"
          localStorage.removeItem(fileUri)
      
      @_removeFromProjectsList(projectName)
      @lib.remove(project)
      
      return d.resolve()
      
    renameProject:(oldName, newName)=>
      #EVEN MORREEE HACKS ! thanks backbone
      project = @lib.get(oldName)
      @lib.remove(project)
      project.name = newName
      
      projectURI = "#{@storeURI}-#{newName}"
      project.localstorage = new Backbone.LocalStorage(projectURI)
      rootStoreURI = "#{projectURI}-files"
      project.rootFolder.changeStorage("localStorage",new Backbone.LocalStorage(rootStoreURI))
      project.save()
      
      @lib.add(project)
    
    destroyFile:(projectName, fileName)=>
      return @_removeFile(projectName, fileName)  
      
    _removeFromProjectsList:(projectName)=>
      projects = localStorage.getItem(@storeURI)
      if projects?
        projects = projects.split(',')
        index = projects.indexOf(projectName)
        if index != -1
          projects.splice(index, 1)
          if projects.length>0 then projects=projects.join(',') else projects = ""
          localStorage.setItem(@storeURI,projects)
          index = @projectsList.indexOf(projectName)
          @projectsList.splice(index, 1)
          
          console.log "projectName"
          projectURI = "#{@storeURI}-#{projectName}"
          rootStoreURI = "#{projectURI}-files"
          
          localStorage.removeItem(rootStoreURI)
          localStorage.removeItem(projectURI)
      
    _addToProjectsList:(projectName)=>
      projects = localStorage.getItem(@storeURI)
      if projects?
        if projects == ""
          projects = "#{projectName}"
        else
          projects = projects.split(',')
          if not (projectName in projects)
            projects.push(projectName)
            projects = projects.join(',')
      else
        projects = "#{projectName}"
      
      @projectsList.push(projectName)
      localStorage.setItem(@storeURI,projects)
        
    _removeFile:(projectName, fileName)=>
      projectURI = "#{@storeURI}-#{projectName}"
      filesURI = "#{projectURI}-files"
      fileNames = localStorage.getItem(filesURI)
      fileNames = fileNames.split(',')
      index = fileNames.indexOf(fileName)
      fileNames.splice(index, 1)
      fileNames = fileNames.join(',')
      localStorage.setItem(filesURI,fileNames)
      
      fileURI = "#{filesURI}-#{fileName}"
      localStorage.removeItem(fileURI)
      
    _getProjectFiles:(projectName)=>
      projectURI = "#{@storeURI}-#{projectName}"
      filesURI = "#{projectURI}-files"
      fileNames = localStorage.getItem(filesURI)
      if fileNames is null
        console.log "need to fetch the file info from YM."
        # $.when ????
        return @_fetchFileListForDesign(projectName)

      else
        fileNames = fileNames.split(',')
      return fileNames

    _fetchFileListForDesign:(designSlug)=>
      console.log "fetching file list for #{designSlug} synchronously..."
      jQuery.ajaxSetup({async:false});
      url = "#{@apiURL}/designs/#{designSlug}/documents.json"
      console.log "url = #{url}"
      req = $.getJSON url, {auth_token:@token}, (data, resp) =>
        window.myData = []
        for num,design of data
          console.log 'design',design
          window.myData.push design.file.url

      console.log("fetched list: ",window.myData)
      jQuery.ajaxSetup({async:true});
      return window.myData

      
    _readFile:(projectName, fileName)=>
      projectURI = "#{@storeURI}-#{projectName}"
      filesURI = "#{projectURI}-files"
      fileNames = localStorage.getItem(filesURI)
      if fileNames isnt null
        fileNames = fileNames.split(',')
        if fileName in fileNames
          fileUri = "#{filesURI}-#{fileName}"
          fileData = localStorage.getItem(fileUri)
          rawData = JSON.parse(fileData)
          console.log "raw file Data", rawData
          return rawData["content"]
        else
          throw new Error("no such file")
      else
        #fixme: although its probably a tiny XML file, synchronous downloading is probably a horrible thing
        # TODO ;)
        # TODO replace with URL: http://api.youmagine.com/documents/{id}/download
        console.log '---------fetching file from youmagine -------'
        jQuery.ajaxSetup({async:false});
        newUrl = "http://my.ultimaker.net/tests/myproxy/?url=" + escape fileName
        req = $.get newUrl,null, (data, resp) =>
          window.myData = data
          console.log 'design data:',data
          # window.myData.push design.file.url

        console.log("fetched list: ",window.myData)
        jQuery.ajaxSetup({async:true});
        serializer = new XMLSerializer()
        str = serializer.serializeToString(window.myData)
        console.log str
        return str 
      
      
    _sourceFetchHandler:([store, projectName, path, deferred])=>
      #This method handles project/file content requests and returns appropriate data
      if store != "browser"
        return null
      #console.log "handler recieved #{store}/#{projectName}/#{path}"
      result = ""
      if not projectName? and path?
        shortName = path
        #console.log "proj"
        #console.log @project
        file = @project.rootFolder.get(shortName)
        result = file.content
        result = "\n#{result}\n"
      else if projectName? and not path?
        console.log "will fetch project #{projectName}'s namespace"
        project = @getProject(projectName)
        console.log project
        namespaced = {}
        for index, file of project.rootFolder.models
          namespaced[file.name]=file.content
          
        namespaced = "#{projectName}={"
        for index, file of project.rootFolder.models
          namespaced += "#{file.name}:'#{file.content}'"
        namespaced+= "}"
        #namespaced = "#{projectName}="+JSON.stringify(namespaced)
        #namespaced = """#{projectName}=#{namespaced}"""
        result = namespaced
        
      else if projectName? and path?
        console.log "will fetch #{path} from #{projectName}"
        getContent=(project) =>
          project.rootFolder.fetch()
          file = project.rootFolder.get(path)
          
          #now we replace all "local" (internal to the project includes) with full path includes
          result = file.content
          result = result.replace /(?!\s*?#)(?:\s*?include\s*?)(?:\(?\"([\w\//:'%~+#-.*]+)\"\)?)/g, (match,matchInner) =>
            includeFull = matchInner.toString()
            return """\ninclude("browser:#{projectName}/#{includeFull}")\n"""
          result = "\n#{result}\n"
          #console.log "youmagineStore returning #{result}"
          
          deferred.resolve(result)
        @loadProject(projectName,true).done(getContent)
      
    _getAllProjectsHelper:()->
      #just a a temporary helper, as the projects List seems to have been cleared by accident?
      projects = []
      console.log "localStorage",localStorage
      for item, key of localStorage
        projData = item.split("-")
        #console.log "projData",projData
        if projData[0] is "projects"
          console.log "item", item
          projectName = projData[1]
          if projectName?
            if projectName not in projects
              projects.push(projectName)
      console.log "projects", projects.join(",")
       
      #projectURI = "#{@storeURI}-#{projectName}"
      #filesURI = "#{projectURI}-files"
      #fileNames = localStorage.getItem(filesURI)
      
       
  return YouMagineStore