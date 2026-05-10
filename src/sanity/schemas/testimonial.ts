import { defineType, defineField } from 'sanity'

export const testimonial = defineType({
  name: 'testimonial',
  title: 'Testimonial',
  type: 'document',
  fields: [
    defineField({
      name: 'quote',
      type: 'text',
      rows: 4,
      validation: (r) => r.required().max(400),
    }),
    defineField({
      name: 'personName',
      type: 'string',
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: 'personRole',
      type: 'string',
      description: 'e.g. Mushroom Farmer, FPO Member, Workshop Attendee',
      validation: (r) => r.required().max(80),
    }),
    defineField({
      name: 'location',
      type: 'string',
      description: 'e.g. Banwal, Ajmer',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'photo',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
      ],
    }),
    defineField({
      name: 'vertical',
      type: 'reference',
      to: [{ type: 'vertical' }],
      description: 'Tie to Shroom/Hive/Fresh/Learn/Technovation for filtering',
    }),
    defineField({
      name: 'rating',
      type: 'number',
      description: 'Rating from 1 to 5',
      validation: (r) => r.min(1).max(5).integer(),
    }),
    defineField({
      name: 'videoUrl',
      type: 'url',
      description: 'YouTube/Vimeo URL for video testimonial',
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'displayOrder',
      type: 'number',
      initialValue: 100,
    }),
    defineField({
      name: 'dateCollected',
      type: 'date',
      description: 'When the testimonial was given',
    }),
  ],
  preview: {
    select: { title: 'personName', subtitle: 'personRole', media: 'photo' },
  },
  orderings: [
    {
      title: 'Display order',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
  ],
})
