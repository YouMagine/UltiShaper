class ShapesController < ApplicationController
  # protect_from_forgery :except => :create
  # GET /shapes
  # GET /shapes.json
  def index
    logger.fatal "index ===================="
    @shapes = Shape.all

    respond_to do |format|
      format.html # index.html.erb
      format.json { render :json => @shapes }
    end
  end

  # GET /shapes/1
  # GET /shapes/1.json
  def show
    if params[:id] == 'all'
      @shape = Shape.all 
    else
      @shape = Shape.find(params[:id]) 
    end
    respond_to do |format|
      format.html # show.html.erb
      format.json { render :json => @shape }
    end
  end

  # GET /shapes/new
  # GET /shapes/new.json
  def new

    @shape = Shape.new

    respond_to do |format|
      format.html # new.html.erb
      format.json { render :json => @shape }
    end
  end

  # GET /shapes/1/edit
  def edit
    @shape = Shape.find(params[:id])
  end

  # POST /shapes
  # POST /shapes.json
  def create
    logger.info "==== creating ======"
    unless params[:shape].nil?
      logger.info "shape is nil."
      logger.info params[:shape][:name] unless params[:shape][:name].nil?
      @existingShape = Shape.where(:name => params[:shape][:name]) unless params[:shape][:name].nil?
      logger.info "found a shape"
    end
    unless @existingShape.empty?
      logger.info "found a shape to update...!"
      if @existingShape.first.update_attributes(params[:shape])
        respond_to do |format|
          render :inline => 'Shape was succesfully updated.'
          return
        end
      else
        respond_to do |format|
          format.json { render :inline => 'Shape was not updated.' }
          return
        end
      end
    end

    @shape = Shape.new(params[:shape])

    respond_to do |format|
      if @shape.save
        format.html do
          redirect_to @shape, :notice => 'Shape was successfully created.'
        end
        format.json do
          render :inline => 'Shape was succesfully created.'
        end
        # format.json { render json: 'Shape was succesfully created.', status: :created, location: @shape }
      else
        format.html { render :action => "new" }
        format.json { render :inline => 'Shape was not saved.' }
        # format.json { render json: @shape.errors, status: :unprocessable_entity }
      end
    end
  end

  # PUT /shapes/1
  # PUT /shapes/1.json
  def update
    @shape = Shape.find(params[:id])

    respond_to do |format|
      if @shape.update_attributes(params[:shape])
        format.html { redirect_to @shape, :notice => 'Shape was successfully updated.' }
        # format.json { head :no_content }
        format.json { render :inline => 'Shape was succesfully updated.' }
      else
        format.html { render :action => "edit" }
        format.json { render :json => @shape.errors, :status => :unprocessable_entity }
      end
    end
  end

  # DELETE /shapes/1
  # DELETE /shapes/1.json
  def destroy
    @shape = Shape.find(params[:id])
    @shape.destroy

    respond_to do |format|
      format.html { redirect_to shapes_url }
      format.json { head :no_content }
    end
  end
end
