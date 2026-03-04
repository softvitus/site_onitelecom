# Configuração Manual de Nginx + SSL (Se necessário)

Se o workflow falhar ao conectar como `root` ou executar Nginx setup via SSH, você pode fazer a configuração manualmente no servidor.

## Opção 1: Configure sudoers para deployer (Recomendado)

Execute no servidor como root:

```bash
ssh -i ~/.ssh/id_ed25519 softvirtus@177.223.51.9

# Faça login normalmente ou use su para root
sudo -i

# Configure sudoers para deployer
cat > /etc/sudoers.d/deployer-app << 'EOF'
deployer ALL=(ALL) NOPASSWD: /usr/bin/apt-get
deployer ALL=(ALL) NOPASSWD: /bin/systemctl
deployer ALL=(ALL) NOPASSWD: /usr/sbin/nginx
deployer ALL=(ALL) NOPASSWD: /usr/bin/certbot
deployer ALL=(ALL) NOPASSWD: /usr/bin/curl
EOF

# Verifique se sintaxe está correta
visudo -c

# Agora deployer pode usar sudo para esses comandos sem senha
```

## Opção 2: Execute setup-nginx-ssl.sh manualmente como root

```bash
# Conecte ao servidor como seu usuário
ssh softvirtus@177.223.51.9

# Faça su para root
su -

# Execute o script de setup
bash -c 'curl -fsSL https://raw.githubusercontent.com/softvitus/site_onitelecom/main/scripts/setup-nginx-ssl.sh | bash'
```

## Opção 3: Configure SSH para root

Se quiser conectar como root via SSH (menos seguro):

```bash
# No servidor como root:
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Adicione a chave SSH do deployer também para root
cat /home/deployer/.ssh/authorized_keys >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys

# Configure SSH para permitir login de root
# Edite /etc/ssh/sshd_config e descomente:
# PermitRootLogin yes
# RestartSSHD: systemctl restart ssh
```

## Verificar status após setup

```bash
# Verifique se Nginx está rodando
sudo systemctl status nginx

# Verifique certificados SSL
sudo ls -la /etc/letsencrypt/live/

# Teste HTTPS
curl https://site.onitelecom.com.br -v
```

## Domínios configurados

- site.onitelecom.com.br → localhost:3000 (Frontend)
- sitepainel.onitelecom.com.br → localhost:3001 (Painel)
- backend.onitelecom.com.br → localhost:5000 (Backend API)
