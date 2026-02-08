import { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'content',
      type: 'textarea',
      required: true,
    },
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: false,
    },
    {
      name: 'attachments',
      type: 'relationship',
      relationTo: 'attachments',
      hasMany: true,
    },
    {
      name: 'source',
      type: 'select',
      options: [
        { label: 'User', value: 'user' },
        { label: 'AI Ingest', value: 'ai-ingest' },
      ],
      defaultValue: 'user',
    },
    {
      name: 'originalUrl',
      type: 'text',
      label: 'Original URL (for AI ingested posts)',
    },
    {
      name: 'attachmentUrls',
      type: 'array',
      fields: [
        {
          name: 'url',
          type: 'text',
          required: true,
        },
      ],
    },
  ],
  access: {
    create: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return user.status === 'approved'
    },
    read: () => true,
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        author: {
          equals: user.id,
        },
      }
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'admin') return true
      return {
        author: {
          equals: user.id,
        },
      }
    },
  },
}
