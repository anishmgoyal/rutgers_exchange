class ProductController < ApplicationController

    include SessionsHelper

    before_filter :require_auth, only: [:create, :update, :delete]

    # PUT /product
    # Please see /outlines/product_api.txt
    def create
        product = Product.new()

        product.product_name = params[:product_name]
        product.price = params[:price]
        product.product_type = params[:product_type]
        product.sold_status = "SOLD_NOT_SOLD"
        product.description = params[:description]
        product.user = @current_user

        if product.save()
            payload = {
                error: false,
                id: product.id
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
        end
    end

    # GET /product
    # Please see /outlines/product_api.txt
    def list
        params[:products_per_page] ||= 10
        params[:page] ||= 1
        offset = (params[:page].to_i - 1) * params[:products_per_page].to_i
    
        products = Product.limit(params[:products_per_page].to_i).offset(offset).all
        products_for_json = []
        products.each do |product|
            product_for_json = {
                product_id: product.id,
                product_name: product.product_name,
                product_price: product.price,
                user: {
                    first_name: product.user.first_name,
                    last_name: product.user.last_name
                }
            }
            products_for_json << product_for_json
        end
        payload = {products: products_for_json}
        render status: 200, json: payload
    end

    # GET /product:id
    # Please see /outlines/product_api.txt
    def read
        product = Product.find(params[:id])
        if product
            payload = {
                product_name: product.product_name,
                user: {
                    user_id: product.user.id,
                    username: product.user.username,
                    first_name: product.user.first_name,
                    last_name: product.user.last_name
                },
                product_type: product.product_type,
                price: product.price,
                status: product.sold_status,
                description: product.description
            }
            render status: 200, json: payload
        else
            render status: 404, json: {error: true}
        end
    end

    # POST /product/:id
    # Please see /outlines/product_api.txt
    def update
        product = Product.find(params[:id])
        if product
            if @current_user.id == product.user.id
            
                product.product_name = params[:product_name] if params[:product_name]
                product.price = params[:price] if params[:price]
                product.product_type = params[:product_type] if params[:product_type]
                product.sold_status = params[:sold_status] if params[:sold_status]
                product.description = params[:description] if params[:description]
            
                if product.save()
                    payload = {
                        error: false,
                        id: product.id
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
                end
            else
                render status: 403, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end

    # DELETE /product/:id
    # Please see /outlines/product_api.txt
    def delete
        product = Product.find(params[:id])
        if product
            if @current_user.id == product.user.id
                product.destroy
                render status: 200, json: {error: false}
            else
                render status: 403, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end


end
