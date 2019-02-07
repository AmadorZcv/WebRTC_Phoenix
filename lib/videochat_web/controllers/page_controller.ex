defmodule VideochatWeb.PageController do
  use VideochatWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
