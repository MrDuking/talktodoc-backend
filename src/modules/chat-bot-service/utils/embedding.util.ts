import { ConfigService } from '@nestjs/config'
import { OpenAI } from 'openai'

export async function getEmbedding(input: string, configService: ConfigService): Promise<number[]> {
  const openai = new OpenAI({
    apiKey: configService.get<string>('OPENAI_API_KEY'),
    baseURL: 'https://gpt1.shupremium.com/v1',
  })
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input,
  })
  return response.data[0].embedding
}
