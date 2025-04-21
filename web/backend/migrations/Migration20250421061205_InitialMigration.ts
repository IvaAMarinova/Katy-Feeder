import { Migration } from '@mikro-orm/migrations';

export class Migration20250421061205_InitialMigration extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`feeder\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`is_active\` tinyint(1) not null default false) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`pet\` (\`id\` int unsigned not null auto_increment primary key, \`name\` varchar(255) not null, \`breed\` varchar(255) not null, \`sex\` varchar(255) not null, \`age_years\` int not null, \`is_neutered\` tinyint(1) not null, \`activity_level\` int not null, \`target_weight\` int not null, \`current_weight\` int not null, \`food_coefficient\` int not null, \`feeder_id\` int unsigned not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`pet\` add index \`pet_feeder_id_index\`(\`feeder_id\`);`);

    this.addSql(`create table \`user\` (\`id\` int unsigned not null auto_increment primary key, \`email\` varchar(255) not null, \`password\` varchar(255) not null) default character set utf8mb4 engine = InnoDB;`);

    this.addSql(`create table \`feeder_users\` (\`feeder_id\` int unsigned not null, \`user_id\` int unsigned not null, primary key (\`feeder_id\`, \`user_id\`)) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`feeder_users\` add index \`feeder_users_feeder_id_index\`(\`feeder_id\`);`);
    this.addSql(`alter table \`feeder_users\` add index \`feeder_users_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`pet\` add constraint \`pet_feeder_id_foreign\` foreign key (\`feeder_id\`) references \`feeder\` (\`id\`) on update cascade;`);

    this.addSql(`alter table \`feeder_users\` add constraint \`feeder_users_feeder_id_foreign\` foreign key (\`feeder_id\`) references \`feeder\` (\`id\`) on update cascade on delete cascade;`);
    this.addSql(`alter table \`feeder_users\` add constraint \`feeder_users_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`pet\` drop foreign key \`pet_feeder_id_foreign\`;`);

    this.addSql(`alter table \`feeder_users\` drop foreign key \`feeder_users_feeder_id_foreign\`;`);

    this.addSql(`alter table \`feeder_users\` drop foreign key \`feeder_users_user_id_foreign\`;`);

    this.addSql(`drop table if exists \`feeder\`;`);

    this.addSql(`drop table if exists \`pet\`;`);

    this.addSql(`drop table if exists \`user\`;`);

    this.addSql(`drop table if exists \`feeder_users\`;`);
  }

}
