# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 20160309222458) do

  create_table "conversations", force: :cascade do |t|
    t.integer  "seller_id",  limit: 4
    t.integer  "buyer_id",   limit: 4
    t.integer  "offer_id",   limit: 4
    t.datetime "created_at",           null: false
    t.datetime "updated_at",           null: false
  end

  add_index "conversations", ["buyer_id"], name: "index_conversations_on_buyer_id", using: :btree
  add_index "conversations", ["seller_id"], name: "index_conversations_on_seller_id", using: :btree

  create_table "messages", force: :cascade do |t|
    t.integer  "user_id",         limit: 4
    t.integer  "conversation_id", limit: 4
    t.text     "message",         limit: 65535
    t.datetime "created_at",                    null: false
    t.datetime "updated_at",                    null: false
  end

  add_index "messages", ["conversation_id"], name: "index_messages_on_conversation_id", using: :btree

  create_table "offers", force: :cascade do |t|
    t.integer  "user_id",         limit: 4
    t.integer  "product_id",      limit: 4
    t.integer  "conversation_id", limit: 4
    t.integer  "price",           limit: 4
    t.string   "offer_status",    limit: 255
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  add_index "offers", ["product_id"], name: "index_offers_on_product_id", using: :btree
  add_index "offers", ["user_id"], name: "index_offers_on_user_id", using: :btree

  create_table "password_recovery_requests", force: :cascade do |t|
    t.integer  "user_id",         limit: 4
    t.string   "recovery_string", limit: 255
    t.string   "recovery_code",   limit: 255
    t.datetime "created_at",                  null: false
    t.datetime "updated_at",                  null: false
  end

  create_table "product_images", force: :cascade do |t|
    t.string   "image_location", limit: 255
    t.string   "session_id",     limit: 255
    t.integer  "ordinal",        limit: 4
    t.integer  "user_id",        limit: 4
    t.integer  "product_id",     limit: 4
    t.datetime "created_at",                 null: false
    t.datetime "updated_at",                 null: false
    t.string   "content_type",   limit: 255
  end

  add_index "product_images", ["product_id"], name: "index_product_images_on_product_id", using: :btree

  create_table "products", force: :cascade do |t|
    t.datetime "created_at",                                 null: false
    t.datetime "updated_at",                                 null: false
    t.string   "product_name", limit: 255
    t.integer  "price",        limit: 4
    t.string   "product_type", limit: 255
    t.text     "description",  limit: 65535
    t.string   "sold_status",  limit: 255
    t.integer  "user_id",      limit: 4
    t.boolean  "is_published",               default: false
  end

  add_index "products", ["user_id"], name: "index_products_on_user_id", using: :btree

  create_table "search_entries", force: :cascade do |t|
    t.string   "word",        limit: 255, null: false
    t.integer  "product_id",  limit: 4,   null: false
    t.string   "filter_type", limit: 255, null: false
    t.datetime "created_at",              null: false
    t.datetime "updated_at",              null: false
    t.integer  "frequency",   limit: 4
  end

  create_table "upload_results", force: :cascade do |t|
    t.integer  "user_id",    limit: 4
    t.text     "output",     limit: 65535
    t.datetime "created_at",               null: false
    t.datetime "updated_at",               null: false
  end

  add_index "upload_results", ["user_id"], name: "index_upload_results_on_user_id", using: :btree

  create_table "users", force: :cascade do |t|
    t.string   "username",           limit: 255
    t.string   "encrypted_password", limit: 255
    t.string   "salt",               limit: 255
    t.string   "first_name",         limit: 255
    t.string   "last_name",          limit: 255
    t.string   "email_address",      limit: 255
    t.datetime "created_at",                     null: false
    t.datetime "updated_at",                     null: false
    t.string   "activation",         limit: 255
  end

end
