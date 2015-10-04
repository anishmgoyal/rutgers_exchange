class ProductController < ApplicationController

  include SessionsHelper
    
  before_filter :require_auth, only: [:read, :update, :logout]

  # PUT /product
  # Please see /outlines/product_api.txt
  def create
  end

  # PUT /product
  # Please see /outlines/product_api.txt
  def create
  end

  # PUT /product
  # Please see /outlines/product_api.txt
  def create
  end

  # PUT /product
  # Please see /outlines/product_api.txt
  def create
  end

  # PUT /product
  # Please see /outlines/product_api.txt
  def create
  end

end
