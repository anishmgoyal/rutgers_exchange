class ProductController < ApplicationController

    include SessionsHelper
    include NotificationHelper

    before_filter :check_auth, only: [:list, :read]
    before_filter :require_auth, only: [:create, :update, :delete]

    # PUT /product
    # Please see /outlines/product_api.txt
    def create
        product = Product.new()

        product.product_name = params[:product_name]
        product.price = params[:price]
        product.product_type = params[:product_type]
        product.is_published = true if params[:is_published]
        product.sold_status = Product.SOLD_NOT_SOLD
        product.description = params[:description]
        product.user = @current_user

        if product.save()

            notify("NOTIF_NEW_PRODUCT", {
                product: {
                    id: product.id,
                    product_name: product.product_name,
                    price: product.price
                }
            })

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
		
        criteria = {}
        criteriaNot = {sold_status: Product.SOLD_SOLD}

        scope = (params[:show_drafts] && @current_user) ? Product.with_drafts(@current_user.id) : Product.published

		if params[:username]
			criteria_user = User.find_by_username params[:username]
			criteria[:user_id] = criteria_user.id if criteria_user
            criteria[:user_id] ||= 0
		end

        criteriaNot[:user_id] = @current_user.id if @current_user and !params[:show_current_user]

        products = scope.where(criteria).where.not(criteriaNot).order(created_at: :desc).limit(params[:products_per_page].to_i).offset(offset).all
        products_for_json = []
        products.each do |product|

	    thumbnail_id = ProductImage.default_image
	    if product.product_images.length > 0
		thumbnail_im = product.product_images.first
	        thumbnail_id = File.join(thumbnail_im.image_location, thumbnail_im.id.to_s)
            end

            product_for_json = {
                product_id: product.id,
                product_name: product.product_name,
                product_price: product.price,
                user: {
                    first_name: product.user.first_name,
                    last_name: product.user.last_name
                },
                thumbnail: thumbnail_id,
                is_published: product.is_published,
				created_at: product.created_at.strftime("%-m/%-d/%Y")
            }
            products_for_json << product_for_json
        end
        payload = {products: products_for_json}
        render status: 200, json: payload
    end

    # GET /product/:id
    # Please see /outlines/product_api.txt
    def read
        scope = (@current_user) ? Product.with_drafts(@current_user.id) : Product.published
        product = scope.find_by_id(params[:id])
        if product

	    images = []
	    product.product_images.each do |image|
		images << File.join(image.image_location, image.id.to_s)
	    end

            payload = {
                product_id: product.id,
                product_name: product.product_name,
                user: {
                    user_id: product.user.id,
                    username: product.user.username,
                    first_name: product.user.first_name,
                    last_name: product.user.last_name
                },
                images: images,
                is_published: product.is_published,
                product_type: product.product_type,
                price: product.price,
                sold_status: product.sold_status,
                description: product.description,
				created_at: product.created_at.strftime("%-m/%-d/%Y")
            }
            render status: 200, json: payload
        else
            render status: 404, json: {error: true}
        end
    end

    # POST /product/:id
    # Please see /outlines/product_api.txt
    def update
        product = Product.with_drafts(@current_user.id).find_by_id(params[:id])
        if product
            if @current_user.id == product.user.id

                product.product_name = params[:product_name] if params[:product_name]
                product.price = params[:price] if params[:price]
                product.product_type = params[:product_type] if params[:product_type]
                product.is_published = params[:is_published] if params[:is_published]
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
                render status: 473, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end

    # DELETE /product/:id
    # Please see /outlines/product_api.txt
    def delete
        product = Product.with_drafts(@current_user.id).find_by_id(params[:id])
        if product
            if @current_user.id == product.user.id
                product.destroy
                render status: 200, json: {error: false}
            else
                render status: 473, json: {error: true}
            end
        else
            render status: 404, json: {error: true}
        end
    end

end
