import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose"
import { BaseSchema } from "./base.schema"

const COLLECTION_NAME = "applications_auth"
@Schema({
    collection: COLLECTION_NAME,
    timestamps: true,
    versionKey: false
})
export class Application extends BaseSchema {
    @Prop({ type: String, unique: true, required: true })
    appId: string

    @Prop({ type: String, required: true })
    serviceName: string

    @Prop({ type: String, required: true })
    apiKey: string
}
export const ApplicationSchema = SchemaFactory.createForClass(Application)
