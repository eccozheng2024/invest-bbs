import { CollectionConfig } from 'payload'

export const Attachments: CollectionConfig = {
  slug: 'attachments',
  upload: {
    staticDir: 'uploads',
    mimeTypes: [
      'application/pdf',
      'video/mp4',
      'video/quicktime',
      'application/epub+zip',
      'application/x-mobipocket-ebook',
    ],
  },
  admin: {
    useAsTitle: 'filename',
  },
  fields: [
    {
      name: 'post',
      type: 'relationship',
      relationTo: 'posts',
    },
    {
      name: 'filename',
      type: 'text',
    },
    {
      name: 'fileSize',
      type: 'number',
    },
    {
      name: 'mimeType',
      type: 'text',
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
      return user.role === 'admin'
    },
    delete: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'admin'
    },
  },
}
