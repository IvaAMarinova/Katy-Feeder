import { Migration } from '@mikro-orm/migrations';

export class Migration20250421070009_addPetFields extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`pet\` add \`morning_portion_grams\` int not null, add \`afternoon_portion_grams\` int not null, add \`evening_portion_grams\` int not null, add \`last_weight_update_date\` datetime not null default CURRENT_TIMESTAMP;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`pet\` drop column \`morning_portion_grams\`, drop column \`afternoon_portion_grams\`, drop column \`evening_portion_grams\`, drop column \`last_weight_update_date\`;`);
  }

}
