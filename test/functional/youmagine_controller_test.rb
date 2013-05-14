require 'test_helper'

class YoumagineControllerTest < ActionController::TestCase
  test "should get get_token" do
    get :get_token
    assert_response :success
  end

end
