import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const ComEleRel = sequelize.define(
    'ComEleRel',
    {
      cer_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cer_com_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0004_Componente',
          key: 'com_id',
        },
      },
      cer_ele_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0005_Elemento',
          key: 'ele_id',
        },
      },
      cer_ordem: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      cer_habilitado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: '0007_Com_Ele_Rel',
      timestamps: true,
      underscored: false,
    },
  );

  ComEleRel.associate = (models) => {
    ComEleRel.belongsTo(models.Componente, {
      foreignKey: 'cer_com_id',
    });

    ComEleRel.belongsTo(models.Elemento, {
      foreignKey: 'cer_ele_id',
    });
  };

  return ComEleRel;
}
