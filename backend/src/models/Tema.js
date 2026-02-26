import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Tema = sequelize.define('Tema', {
    tem_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    tem_par_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: '0001_Parceiro',
        key: 'par_id',
      },
    },
    tem_nome: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  }, {
    tableName: '0002_Tema',
    timestamps: true,
    underscored: false,
  });

  Tema.associate = (models) => {
    Tema.belongsTo(models.Parceiro, {
      foreignKey: 'tem_par_id',
      as: 'parceiro',
    });

    Tema.hasMany(models.Pagina, {
      foreignKey: 'pag_tem_id',
      as: 'paginas',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Tema.hasMany(models.Cores, {
      foreignKey: 'cor_tem_id',
      as: 'cores',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Tema.hasMany(models.Imagens, {
      foreignKey: 'img_tem_id',
      as: 'imagens',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Tema.hasMany(models.Links, {
      foreignKey: 'lin_tem_id',
      as: 'links',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Tema.hasMany(models.Textos, {
      foreignKey: 'txt_tem_id',
      as: 'textos',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Tema.hasMany(models.Conteudo, {
      foreignKey: 'cnt_tem_id',
      as: 'conteudos',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Tema.hasMany(models.Features, {
      foreignKey: 'fea_tem_id',
      as: 'features',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Tema.hasMany(models.ConfigTema, {
      foreignKey: 'cfg_tem_id',
      as: 'configs',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });
  };

  return Tema;
}
