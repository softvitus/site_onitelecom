import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const ConfigTema = sequelize.define(
    'ConfigTema',
    {
      cfg_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      cfg_tem_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: '0002_Tema',
          key: 'tem_id',
        },
      },
      cfg_chave: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      cfg_valor: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: '0014_Config_Tema',
      timestamps: true,
      underscored: false,
    },
  );

  ConfigTema.associate = (models) => {
    ConfigTema.belongsTo(models.Tema, {
      foreignKey: 'cfg_tem_id',
      as: 'tema',
    });
  };

  return ConfigTema;
}
