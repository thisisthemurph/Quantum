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

type databaseConfig struct {
	ConnectionString string
	Name             string
}

type Config struct {
	Host          string
	ClientBaseURL string
	Environment   Environment
	Database      databaseConfig
}

func NewAppConfig(get func(string) string) *Config {
	return &Config{
		Host:          get("HOST"),
		ClientBaseURL: get("CLIENT_BASE_URL"),
		Environment:   NewEnvironment(get("ENVIRONMENT")),
		Database: databaseConfig{
			ConnectionString: get("DATABASE_CONNECTION_STRING"),
			Name:             get("DATABASE_NAME"),
		},
	}
}
