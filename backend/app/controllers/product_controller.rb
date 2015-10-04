class ProductController < ApplicationController

  include SessionsHelper
    
  before_filter :require_auth, only: [:read, :update, :remove]

  # PUT /product
  # Please see /outlines/product_api.txt
  def create
  end
 
  # GET /product
  # Please see /outlines/product_api.txt
  def list
  end
 

  # GET /product:id
  # Please see /outlines/product_api.txt
  def read
    product = Product.find(params[:id])
    if product
      payload = {
        product_name: product.product_name,
        user: product.user.username,
        type: product.type,
        price: product.price,
        status: product.sold_status
      }
    else
      render status: 404, json: {error: true}
    end
  end

  # POST /product:id
  # Please see /outlines/product_api.txt
  def update
    product = Product.find(params[:id])
    if product
      if @current_user.id == product.user.id
        if @current_product.update(params)
          payload = {
            error: false,
            id: @current_product.id
          }
          render status: 200, json: payload
        else
          errors = []
          product.errors.keys.each do |key|
          errors << {field: key, message: product.errors.full_messages_for(key).first}
        end
        payload = {
        error: true,
        errors: errors
        }
        render status: 200, json: payload
      else
        render status: 403, json: {error: true}
      end
    else  
      render status: 404, json: {error: true}
    end
  end

  # DELETE /product:id
  # Please see /outlines/product_api.txt
  def delete
    product = Product.find(param[:id])
    if product
      if @current_user.id == product.user.id
          product.destroy
      else
        render status: 403, json: {error: true}
      end
    else
      render status: 404, json: {error: true}
    end    
  end

end
