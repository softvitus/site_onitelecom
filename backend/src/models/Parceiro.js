import { DataTypes } from 'sequelize';

export default function (sequelize) {
  const Parceiro = sequelize.define(
    'Parceiro',
    {
      par_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      par_nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      par_dominio: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      par_dominio_painel: {
        type: DataTypes.STRING(255),
        allowNull: true,
        comment: 'Domínio para acesso ao painel administrativo',
      },
      par_cidade: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      par_estado: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: 'UF - Unidade Federativa (estado)',
      },
      par_endereco: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      par_cep: {
        type: DataTypes.STRING(10),
        allowNull: true,
      },
      par_latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      par_longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      par_raio_cobertura: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 50,
      },
      par_status: {
        type: DataTypes.ENUM('ativo', 'inativo', 'suspenso'),
        allowNull: false,
        defaultValue: 'ativo',
      },
    },
    {
      tableName: '0001_Parceiro',
      timestamps: true,
      underscored: false,
    },
  );

  Parceiro.associate = (models) => {
    Parceiro.hasMany(models.Tema, {
      foreignKey: 'tem_par_id',
      as: 'temas',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    Parceiro.hasMany(models.Pagina, {
      foreignKey: 'pag_par_id',
      as: 'paginas',
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
    });

    // Um parceiro pode ter muitos usuários (gestores e usuários)
    if (models.Usuario) {
      Parceiro.hasMany(models.Usuario, {
        foreignKey: 'usu_parceiro_id',
        as: 'usuarios',
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      });
    }
  };

  return Parceiro;
}
