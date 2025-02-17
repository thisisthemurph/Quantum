package app

type Environment string

const DevelopmentEnvironment Environment = "development"
const ProductionEnvironment Environment = "production"

func NewEnvironment(env string) Environment {
	switch env {
	case string(ProductionEnvironment):
		return ProductionEnvironment
	default:
		return DevelopmentEnvironment
	}
}

func (e Environment) IsDevelopment() bool {
	return e == DevelopmentEnvironment
}

type DatabaseConfig struct {
	ConnectionString string
	Name             string
}

type Config struct {
	Host          string
	ClientBaseURL string
	SessionSecret string
	Environment   Environment
	Database      DatabaseConfig
}

func NewAppConfig(get func(string) string) *Config {
	return &Config{
		Host:          get("HOST"),
		ClientBaseURL: get("CLIENT_BASE_URL"),
		SessionSecret: get("SESSION_SECRET"),
		Environment:   NewEnvironment(get("ENVIRONMENT")),
		Database: DatabaseConfig{
			ConnectionString: get("DATABASE_CONNECTION_STRING"),
			Name:             get("DATABASE_NAME"),
		},
	}
}
