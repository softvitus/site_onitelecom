/**
 * RolePermissao Model
 * Mapeia tipos de usuário (roles) a permissões
 */

import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const RolePermissao = sequelize.define(
    'RolePermissao',
    {
      roleperm_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      roleperm_tipo: {
        type: DataTypes.ENUM('admin', 'gestor', 'usuario'),
        allowNull: false,
      },
      roleperm_perm_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0061_Permissoes',
          key: 'perm_id',
        },
      },
    },
    {
      tableName: '0062_RolePermissoes',
      timestamps: true,
      underscored: false,
    },
  );

  /**
   * Associações
   */
  RolePermissao.associate = (models) => {
    // Uma RolePermissao referencia uma Permissao
    if (models.Permissao) {
      RolePermissao.belongsTo(models.Permissao, {
        foreignKey: 'roleperm_perm_id',
        as: 'permissao',
      });
    }
  };

  /**
   * Métodos estáticos
   */

  /**
   * Buscar todas as permissões de um tipo (role)
   */
  RolePermissao.findByTipo = async function (tipo) {
    return this.findAll({
      where: { roleperm_tipo: tipo },
      include: [
        {
          association: 'permissao',
          attributes: ['perm_id', 'perm_nome', 'perm_modulo', 'perm_acao', 'perm_descricao'],
        },
      ],
    });
  };

  /**
   * Verificar se um tipo tem uma permissão específica
   */
  RolePermissao.temPermissao = async function (tipo, permNome) {
    const rolePermissao = await this.findOne({
      where: { roleperm_tipo: tipo },
      include: [
        {
          association: 'permissao',
          where: { perm_nome: permNome },
          attributes: ['perm_nome'],
        },
      ],
    });

    return !!rolePermissao;
  };

  /**
   * Atribuir permissão a um tipo
   */
  RolePermissao.atribuirPermissao = async function (tipo, permId) {
    return this.findOrCreate({
      where: {
        roleperm_tipo: tipo,
        roleperm_perm_id: permId,
      },
    });
  };

  /**
   * Remover permissão de um tipo
   */
  RolePermissao.removerPermissao = async function (tipo, permId) {
    return this.destroy({
      where: {
        roleperm_tipo: tipo,
        roleperm_perm_id: permId,
      },
    });
  };

  return RolePermissao;
}
