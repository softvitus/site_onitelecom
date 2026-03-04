/**
 * Permissao Model
 * Define permissões do sistema
 */

import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Permissao = sequelize.define(
    'Permissao',
    {
      perm_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      perm_nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isLowercase: true,
          matches: /^[a-z_]+$/,
        },
      },
      perm_descricao: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      perm_modulo: {
        type: DataTypes.ENUM(
          'tema',
          'pagina',
          'componente',
          'elemento',
          'usuario',
          'parceiro',
          'relatorios',
          'auditoria',
        ),
        allowNull: false,
      },
      perm_acao: {
        type: DataTypes.ENUM('criar', 'listar', 'editar', 'deletar', 'visualizar', 'exportar', 'estatisticas', 'filtrar'),
        allowNull: false,
      },
    },
    {
      tableName: '0061_Permissoes',
      timestamps: true,
      underscored: false,
    },
  );

  /**
   * Associações
   */
  Permissao.associate = (models) => {
    // Uma permissão pode ser atribuída a múltiplos roles
    if (models.RolePermissao) {
      Permissao.hasMany(models.RolePermissao, {
        foreignKey: 'roleperm_perm_id',
        as: 'rolePermissoes',
        onDelete: 'CASCADE',
      });
    }
  };

  /**
   * Métodos estáticos
   */

  /**
   * Buscar permissão por nome
   */
  Permissao.findByNome = async function (nome) {
    return this.findOne({
      where: { perm_nome: nome },
    });
  };

  /**
   * Buscar permissões de um módulo
   */
  Permissao.findByModulo = async function (modulo) {
    return this.findAll({
      where: { perm_modulo: modulo },
      order: [['perm_acao', 'ASC']],
    });
  };

  /**
   * Buscar permissões de um módulo e ação
   */
  Permissao.findByModuloAcao = async function (modulo, acao) {
    return this.findOne({
      where: { perm_modulo: modulo, perm_acao: acao },
    });
  };

  return Permissao;
}
