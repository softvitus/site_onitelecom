/**
 * Usuario Model
 * Usuários do sistema com autenticação
 */

import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Usuario = sequelize.define(
    'Usuario',
    {
      usu_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      usu_email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      usu_nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      usu_senha: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      usu_telefone: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      usu_status: {
        type: DataTypes.ENUM('ativo', 'inativo', 'bloqueado'),
        defaultValue: 'ativo',
        allowNull: false,
      },
      usu_tipo: {
        type: DataTypes.ENUM('admin', 'gestor', 'usuario'),
        defaultValue: 'usuario',
        allowNull: false,
      },
      usu_ultimo_acesso: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      usu_tentativas_login: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
      usu_parceiro_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: '0001_Parceiro',
          key: 'par_id',
        },
      },
    },
    {
      tableName: '0060_Usuarios',
      timestamps: true,
      underscored: false,
    }
  );

  /**
   * Associações
   */
  Usuario.associate = (models) => {
    // Um usuário pertence a um parceiro (para gestor e usuario)
    if (models.Parceiro) {
      Usuario.belongsTo(models.Parceiro, {
        foreignKey: 'usu_parceiro_id',
        as: 'parceiro',
      });
    }

    // Um usuário pode ter muitos logs de atividade
    if (models.LogAtividade) {
      Usuario.hasMany(models.LogAtividade, {
        foreignKey: 'log_usu_id',
        as: 'logs',
      });
    }

    // Um usuário pode ter muitas sessões
    if (models.Sessao) {
      Usuario.hasMany(models.Sessao, {
        foreignKey: 'ses_usu_id',
        as: 'sessoes',
      });
    }
  };

  /**
   * Métodos de instância
   */
  Usuario.prototype.toJSON = function () {
    const valores = Object.assign({}, this.get());
    delete valores.usu_senha; // Nunca retornar a senha
    return valores;
  };

  /**
   * Métodos estáticos
   */

  /**
   * Buscar usuário por email
   */
  Usuario.findByEmail = async (email) => {
    return Usuario.findOne({
      where: { usu_email: email },
    });
  };

  /**
   * Buscar usuários ativos
   */
  Usuario.findActive = async (pagination = {}) => {
    const limit = pagination.limit || 10;
    const offset = ((pagination.page || 1) - 1) * limit;

    return Usuario.findAndCountAll({
      where: { usu_status: 'ativo' },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  };

  /**
   * Buscar por tipo (role)
   */
  Usuario.findByType = async (tipo, pagination = {}) => {
    const limit = pagination.limit || 10;
    const offset = ((pagination.page || 1) - 1) * limit;

    return Usuario.findAndCountAll({
      where: { usu_tipo: tipo },
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  };

  /**
   * Incrementar tentativas de login falhadas
   */
  Usuario.prototype.incrementarTentativas = async function () {
    return this.update({
      usu_tentativas_login: this.usu_tentativas_login + 1,
    });
  };

  /**
   * Resetar tentativas de login
   */
  Usuario.prototype.resetarTentativas = async function () {
    return this.update({
      usu_tentativas_login: 0,
      usu_ultimo_acesso: new Date(),
    });
  };

  /**
   * Verificar se usuário está bloqueado
   */
  Usuario.prototype.estaBloqueado = function () {
    return this.usu_status === 'bloqueado' || this.usu_tentativas_login >= 5;
  };

  /**
   * Bloquear usuário após muitas tentativas
   */
  Usuario.prototype.bloquearPorTentativas = async function () {
    if (this.usu_tentativas_login >= 5) {
      return this.update({ usu_status: 'bloqueado' });
    }
    return this;
  };

  return Usuario;
}
