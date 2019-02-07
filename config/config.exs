# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :videochat,
  ecto_repos: [Videochat.Repo]

# Configures the endpoint
config :videochat, VideochatWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "B1zF4bY3M/IiLknI5YuXoQKnmDzSUsq8bMeAk1+LnqseMPShMNKLqusuznG7J0s2",
  render_errors: [view: VideochatWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Videochat.PubSub, adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
