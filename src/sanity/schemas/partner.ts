import { defineType, defineField } from 'sanity'

export const partner = defineType({
  name: 'partner',
  title: 'Partner',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'name' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'logo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'partnerType',
      type: 'string',
      options: {
        list: [
          { title: 'NGO', value: 'ngo' },
          { title: 'FPO (Farmer Producer Org)', value: 'fpo' },
          { title: 'Government', value: 'government' },
          { title: 'Private', value: 'private' },
          { title: 'Academic', value: 'academic' },
          { title: 'International', value: 'international' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'website', type: 'url' }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (r) => r.max(300),
    }),
    defineField({
      name: 'relationshipSince',
      type: 'number',
      description: 'Year the partnership started',
      validation: (r) => r.min(2000).max(new Date().getFullYear()),
    }),
    defineField({ name: 'isActive', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'name', subtitle: 'partnerType', media: 'logo' },
  },
})
