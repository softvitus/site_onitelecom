"""
Configuração centralizada para testes de integração
"""

# URL Base da API
BASE_URL = "http://localhost:3000/api/v1"

# Credenciais de teste
TEST_ADMIN = {
    "email": "admin@siteoni.com.br",
    "password": "admin123"
}

TEST_USER = {
    "email": "teste@siteoni.com.br",
    "password": "teste123"
}

# IDs de teste (do seeder do banco)
TEST_PARCEIRO_ID = "550e8400-e29b-41d4-a716-446655440001"  # Oni Telecom
TEST_TEMA_ID = "660e8400-e29b-41d4-a716-446655440001"
