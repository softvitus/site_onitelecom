import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Elemento = sequelize.define('Elemento', {
    ele_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    ele_nome: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    ele_descricao: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ele_habilitado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    ele_obrigatório: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  }, {
    tableName: '0005_Elemento',
    timestamps: true,
    underscored: false,
  });

  Elemento.associate = (models) => {
    Elemento.belongsToMany(models.Componente, {
      through: models.ComEleRel,
      foreignKey: 'cer_ele_id',
      otherKey: 'cer_com_id',
      as: 'componentes',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Elemento.hasMany(models.ComEleRel, {
      foreignKey: 'cer_ele_id',
      as: 'com_ele_rels',
    });
  };

  return Elemento;
}
