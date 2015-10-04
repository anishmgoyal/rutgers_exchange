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
  delete '/products:id' => 'product#delete'
  
  # Test offers
  get '/offers/testlist' => 'offer#test_list'
  get '/offers/testread' => 'offer#test_read'
  get '/offers/testcreate' => 'offer#test_create'
  get '/offers/testupdate' => 'offer#test_update'
  get '/offers/testdelete' => 'offer#test_delete'
  get '/offers/testcommit' => 'offer#test_commit'
  
  delete '/offers/delete' => 'offer#delete'
  post '/offers/complete' => 'offer#commit'
  get '/offers/list' => 'offer#list'
  put '/offers/create' => 'offer#create'
  get '/offers/get' => 'offer#read'
  post '/offers/update' => 'offer#update'
  
  # Test conversations
  get '/conversations' => 'conversation#list'
  get '/conversations/testlist' => 'conversation#test_list'
  get '/conversations/testupdate' => 'conversation#test_update'
  get '/conversations/testread' => 'conversation#test_read'
  post '/conversations/send' => 'conversation#update'
  get '/conversations/list' => 'conversation#list'
  

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
