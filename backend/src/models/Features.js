import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Features = sequelize.define(
    'Features',
    {
      fea_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fea_tem_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
      },
      fea_nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      fea_habilitado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      tableName: '0013_Features',
      timestamps: true,
      underscored: false,
    },
  );

  Features.associate = (models) => {
    Features.belongsTo(models.Tema, {
      foreignKey: 'fea_tem_id',
      as: 'tema',
    });
  };

  return Features;
}
