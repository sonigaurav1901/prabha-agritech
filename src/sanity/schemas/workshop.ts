import { defineType, defineField } from 'sanity'

export const workshop = defineType({
  name: 'workshop',
  title: 'Workshop',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      validation: (r) => r.required().max(120),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'vertical',
      type: 'reference',
      to: [{ type: 'vertical' }],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 3,
      validation: (r) => r.required().max(300),
    }),
    defineField({
      name: 'body',
      type: 'array',
      of: [{ type: 'block' }],
      description: 'Curriculum, schedule details',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'coverImage',
      type: 'image',
      options: { hotspot: true },
      fields: [
        defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'format',
      type: 'string',
      options: {
        list: [
          { title: 'In-person', value: 'in-person' },
          { title: 'Online', value: 'online' },
          { title: 'Hybrid', value: 'hybrid' },
        ],
        layout: 'radio',
      },
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'startDate',
      type: 'datetime',
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'endDate',
      type: 'datetime',
      validation: (r) =>
        r.required().custom((endDate, ctx) => {
          const start = (ctx.document as Record<string, unknown> | undefined)?.startDate as
            | string
            | undefined
          if (!start || !endDate) return true
          return (
            new Date(endDate as string) >= new Date(start) ||
            'End date must be on or after start date'
          )
        }),
    }),
    defineField({
      name: 'location',
      type: 'object',
      hidden: ({ parent }) => parent?.format === 'online',
      fields: [
        defineField({ name: 'venue', type: 'string' }),
        defineField({ name: 'city', type: 'string' }),
        defineField({ name: 'state', type: 'string' }),
      ],
    }),
    defineField({
      name: 'meetingLink',
      type: 'url',
      description: 'Zoom/Google Meet link for online or hybrid workshops',
      hidden: ({ parent }) => parent?.format === 'in-person',
    }),
    defineField({
      name: 'instructors',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'teamMember' }] }],
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'language',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        list: [
          { title: 'English', value: 'english' },
          { title: 'Hindi', value: 'hindi' },
        ],
      },
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'fee',
      type: 'object',
      fields: [
        defineField({
          name: 'amount',
          type: 'number',
          description: '0 = free workshop',
          validation: (r) => r.required().min(0),
        }),
        defineField({
          name: 'currency',
          type: 'string',
          initialValue: 'INR',
          readOnly: true,
        }),
      ],
      validation: (r) => r.required(),
    }),
    defineField({
      name: 'seatsTotal',
      type: 'number',
      description: 'Total capacity. Remaining seats are auto-computed at runtime from Firestore enrollments.',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'prerequisites',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'learnings',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'What attendees will learn (bullet list)',
      validation: (r) => r.required().min(1),
    }),
    defineField({
      name: 'whatsIncluded',
      type: 'array',
      of: [{ type: 'string' }],
      description: 'Materials, certificate, lunch, etc.',
    }),
    defineField({
      name: 'gallery',
      type: 'array',
      of: [
        {
          type: 'image',
          options: { hotspot: true },
          fields: [
            defineField({ name: 'alt', type: 'string', validation: (r) => r.required() }),
          ],
        },
      ],
    }),
    defineField({
      name: 'status',
      type: 'string',
      options: {
        list: [
          { title: 'Upcoming', value: 'upcoming' },
          { title: 'Enrolling', value: 'enrolling' },
          { title: 'Full', value: 'full' },
          { title: 'Completed', value: 'completed' },
          { title: 'Cancelled', value: 'cancelled' },
        ],
      },
      validation: (r) => r.required(),
    }),
    defineField({ name: 'featured', type: 'boolean', initialValue: false }),
    defineField({
      name: 'registrationDeadline',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      startDate: 'startDate',
      city: 'location.city',
      media: 'coverImage',
    },
    prepare: ({ title, startDate, city, media }) => {
      const date = startDate ? new Date(startDate).toLocaleDateString('en-IN') : ''
      return {
        title,
        subtitle: [date, city].filter(Boolean).join(' · '),
        media,
      }
    },
  },
  orderings: [
    {
      title: 'Start date (soonest)',
      name: 'startDateAsc',
      by: [{ field: 'startDate', direction: 'asc' }],
    },
  ],
})
