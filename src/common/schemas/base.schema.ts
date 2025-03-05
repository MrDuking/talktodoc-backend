import { Prop } from "@nestjs/mongoose"

export abstract class BaseSchema {
    @Prop()
    deletedAt?: Date

    @Prop()
    createdAt?: Date

    @Prop()
    updatedAt?: Date
}
