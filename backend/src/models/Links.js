import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Links = sequelize.define(
    'Links',
    {
      lin_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      lin_tem_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
      },
      lin_categoria: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      lin_nome: {
        type: DataTypes.STRING(100),
        allowNull: false,
      },
      lin_valor: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: '0010_Links',
      timestamps: true,
      underscored: false,
    },
  );

  Links.associate = (models) => {
    Links.belongsTo(models.Tema, {
      foreignKey: 'lin_tem_id',
      as: 'tema',
    });
  };

  return Links;
}
