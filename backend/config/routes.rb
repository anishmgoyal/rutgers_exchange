Rails.application.routes.draw do

  # User accounts
  get '/users/login' => 'user#login'
  put '/users/lgn' => 'user#authenticate'
  
  put '/users' => 'user#create'
  put '/users/:username' => 'user#authenticate'
  get '/users/:username' => 'user#read'
  post '/users/:id' => 'user#update'
  delete '/users/:username' => 'user#logout'
  
  # Products
  get '/products' => 'product#list'
  put '/products' => 'product#create'
  get '/products/:id' => 'product#read'
  post '/products/:id' => 'product#update'
  delete '/products/:id' => 'product#delete'

  # Product Images
  put '/image/product' => 'product_image#create'
  post '/image/product' => 'product_image#update_multi'
  get '/image/product/:id' => 'product_image#read'
  post '/image/product/:id' => 'product_image#update'
  delete '/image/product/:id' => 'product_image#delete'

  # Support for iframe upload
  get '/image/status/:id' => 'product_image#get_response'
  
  # Offers
  get '/offers' => 'offer#list'
  put '/offers' => 'offer#create'
  get '/offers/:id' => 'offer#read'
  post '/offers/complete/:id' => 'offer#commit'
  post '/offers/accept/:id' => 'offer#accept'
  post '/offers/:id' => 'offer#update'
  delete '/offers/:id' => 'offer#delete'
  
  # Conversations
  get '/conversations' => 'conversation#list'
  get '/conversations/:id' => 'conversation#read'
  put '/conversations/:id' => 'conversation#update'

  # Short-poll notifications
  get '/notifications' => 'notification#list'

  # Search
  get '/search' => 'search#search'

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
