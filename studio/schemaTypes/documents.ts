import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {PinIcon} from '@sanity/icons/Pin'
import {TagIcon} from '@sanity/icons/Tag'
import {WrenchIcon} from '@sanity/icons/Wrench'
import {defineArrayMember, defineField, defineType} from 'sanity'

/** English is the fallback language on the site, so it is the one required. */
const requireEnglish = (message: string) => (value?: {en?: string}) =>
  value?.en ? true : message

/** Spec rows take one value per variant once the vehicle lists variants. */
const hasVariants = (document?: {[key: string]: unknown}) =>
  Array.isArray(document?.specVariants) && document.specVariants.length > 0

export const vehicle = defineType({
  name: 'vehicle',
  title: 'Vehicle',
  type: 'document',
  groups: [
    {name: 'card', title: 'Range card', default: true},
    {name: 'detail', title: 'Detail page'},
    {name: 'sections', title: 'Page sections'},
  ],
  fieldsets: [
    {name: 'specsCard', title: 'Specs card (under the hero)', options: {collapsible: true}},
    {name: 'fullSpecs', title: 'Full specifications', options: {collapsible: true}},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Model name',
      type: 'localeString',
      validation: (rule) => rule.custom(requireEnglish('English name is required.')),
    }),
    defineField({
      name: 'slug',
      title: 'URL slug',
      type: 'slug',
      description: 'Sets the detail page URL, e.g. "emira" → /vehicles/emira',
      options: {source: 'name.en', maxLength: 60},
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'tagline', title: 'Tagline', type: 'localeString'}),
    defineField({
      name: 'overview',
      title: 'Overview',
      type: 'localeText',
      description: 'Lead paragraph on the detail page.',
      group: 'detail',
    }),
    defineField({
      name: 'heroImage',
      title: 'Detail page hero image',
      type: 'figure',
      description:
        'Wide banner at the top of the detail page. Falls back to the card image. Also the poster for the hero video.',
      group: 'detail',
    }),
    defineField({
      name: 'heroVideo',
      title: 'Detail page hero video (MP4, ≤10 MB)',
      type: 'file',
      description:
        'Optional silent loop, H.264 MP4. Plays muted over the hero image, which shows while it loads and for visitors who prefer reduced motion.',
      options: {accept: 'video/mp4,video/webm'},
      group: 'detail',
    }),
    defineField({
      name: 'specsImage',
      title: 'Image',
      type: 'figure',
      description: 'Dimmed behind the headline specs. Landscape.',
      group: 'detail',
      fieldset: 'specsCard',
    }),
    defineField({
      name: 'specsLink',
      title: 'Link',
      type: 'link',
      description: 'Under the specs, e.g. "Explore configuration".',
      group: 'detail',
      fieldset: 'specsCard',
    }),
    defineField({
      name: 'featureImage',
      title: 'Full-width image',
      type: 'figure',
      description: 'Edge to edge under the specs card. Landscape, 16:10.',
      group: 'detail',
    }),
    defineField({
      name: 'carousel',
      title: 'Image carousel',
      type: 'object',
      group: 'detail',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
        defineField({name: 'intro', title: 'Intro', type: 'localeText'}),
        defineField({
          name: 'slides',
          title: 'Slides',
          type: 'array',
          description: 'Portrait images, 8:9.',
          of: [
            defineArrayMember({
              type: 'object',
              name: 'slide',
              fields: [
                defineField({name: 'image', title: 'Image', type: 'figure'}),
                defineField({name: 'caption', title: 'Caption', type: 'localeString'}),
              ],
              preview: {select: {title: 'caption.en', media: 'image'}},
            }),
          ],
        }),
      ],
    }),
    defineField({
      name: 'features',
      title: 'Image and text panels',
      type: 'array',
      group: 'detail',
      description: 'Half image, half text. The image starts on the left and swaps sides each panel.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'feature',
          fields: [
            defineField({name: 'image', title: 'Image', type: 'figure'}),
            defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
            defineField({name: 'body', title: 'Text', type: 'localeText'}),
          ],
          preview: {select: {title: 'heading.en', media: 'image'}},
        }),
      ],
    }),
    defineField({
      name: 'banner',
      title: 'Full-width banner',
      type: 'object',
      group: 'detail',
      description: 'Centred text and a button over a dimmed image.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({name: 'image', title: 'Image', type: 'figure'}),
        defineField({name: 'heading', title: 'Heading', type: 'localeString'}),
        defineField({name: 'body', title: 'Text', type: 'localeText'}),
        defineField({name: 'link', title: 'Button', type: 'link'}),
      ],
    }),
    defineField({
      name: 'gallery',
      title: 'Gallery',
      type: 'array',
      group: 'detail',
      description:
        'Exterior and interior shots. Each supports a zoom lens on the detail page, so upload the highest resolution you have.',
      of: [defineArrayMember({type: 'galleryImage'})],
      validation: (rule) =>
        rule.min(5).warning('Five or more images give the gallery enough to work with.'),
    }),
    defineField({
      name: 'spin360',
      title: '360° view',
      type: 'object',
      group: 'detail',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'enabled',
          title: 'Show the 360° viewer',
          type: 'boolean',
          initialValue: true,
        }),
        defineField({
          name: 'frames',
          title: 'Frames',
          type: 'array',
          of: [defineArrayMember({type: 'figure', name: 'frame'})],
          description:
            'Turntable shots in order, first frame facing front. 24 or 36 frames give a smooth spin; fewer than 12 looks jumpy. All frames must be the same size and framing.',
          validation: (rule) =>
            rule.custom((frames?: unknown[]) =>
              frames?.length && frames.length < 8
                ? 'A 360° spin needs at least 8 frames to read as rotation.'
                : true,
            ),
        }),
      ],
    }),
    defineField({
      name: 'specTableHeading',
      title: 'Heading',
      type: 'localeString',
      group: 'detail',
      fieldset: 'fullSpecs',
    }),
    defineField({
      name: 'specTableIntro',
      title: 'Intro',
      type: 'localeString',
      group: 'detail',
      fieldset: 'fullSpecs',
    }),
    defineField({
      name: 'specVariants',
      title: 'Variants',
      type: 'array',
      group: 'detail',
      fieldset: 'fullSpecs',
      description:
        'Column headings to compare variants side by side, e.g. Hybrid, Hybrid SE. The last one is highlighted. Leave empty for one value per row.',
      of: [defineArrayMember({type: 'localeString'})],
    }),
    defineField({
      name: 'specGroups',
      title: 'Groups',
      type: 'array',
      group: 'detail',
      fieldset: 'fullSpecs',
      description: 'Collapsible groups, e.g. Performance. The first opens by default.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'specGroup',
          fields: [
            defineField({name: 'title', title: 'Group title', type: 'localeString'}),
            defineField({
              name: 'rows',
              title: 'Rows',
              type: 'array',
              of: [
                defineArrayMember({
                  type: 'object',
                  name: 'specRow',
                  fields: [
                    defineField({name: 'label', title: 'Label', type: 'localeString'}),
                    defineField({
                      name: 'value',
                      title: 'Value',
                      type: 'localeString',
                      hidden: ({document}) => hasVariants(document),
                    }),
                    defineField({
                      name: 'values',
                      title: 'Values',
                      type: 'array',
                      description: 'One per variant, in the same order as Variants.',
                      of: [defineArrayMember({type: 'localeString'})],
                      hidden: ({document}) => !hasVariants(document),
                    }),
                  ],
                  preview: {
                    select: {title: 'label.en', value: 'value.en', first: 'values.0.en'},
                    prepare: ({title, value, first}) => ({title, subtitle: first ?? value}),
                  },
                }),
              ],
            }),
          ],
          preview: {
            select: {title: 'title.en', rows: 'rows'},
            prepare: ({title, rows}) => ({
              title: title || 'Group',
              subtitle: `${rows?.length ?? 0} rows`,
            }),
          },
        }),
      ],
    }),
    defineField({
      name: 'disclaimers',
      title: 'Disclaimers',
      type: 'array',
      group: 'detail',
      description: 'Numbered footnotes under the footer. Mark the figures they explain with ¹ ² ³.',
      of: [defineArrayMember({type: 'localeText'})],
    }),
    defineField({
      name: 'subNav',
      title: 'Page menu',
      type: 'object',
      group: 'sections',
      description: 'Bar under the site header with links to parts of this page.',
      options: {collapsible: true, collapsed: true},
      fields: [
        defineField({
          name: 'items',
          title: 'Links',
          type: 'array',
          of: [defineArrayMember({type: 'ctaButton'})],
        }),
        defineField({name: 'cta', title: 'Button', type: 'ctaButton'}),
      ],
    }),
    defineField({
      name: 'sections',
      title: 'Sections',
      type: 'array',
      group: 'sections',
      description: 'The page body, top to bottom. Drag to reorder.',
      of: [
        defineArrayMember({type: 'heroMedia'}),
        defineArrayMember({type: 'introText'}),
        defineArrayMember({type: 'fullWidthVideo'}),
        defineArrayMember({type: 'statsBlock'}),
        defineArrayMember({type: 'featureCarousel'}),
        defineArrayMember({type: 'imageText'}),
      ],
    }),
    defineField({
      name: 'stickyCta',
      title: 'Sticky buttons',
      type: 'object',
      group: 'sections',
      description: 'Pinned to the bottom of the screen while scrolling.',
      options: {collapsible: true, collapsed: true, columns: 2},
      fields: [
        defineField({name: 'left', title: 'Left', type: 'ctaButton'}),
        defineField({name: 'right', title: 'Right', type: 'ctaButton'}),
      ],
    }),
    defineField({name: 'seo', title: 'SEO & sharing', type: 'seo', group: 'detail'}),
    defineField({name: 'image', title: 'Card image', type: 'figure'}),
    defineField({
      name: 'logo',
      title: 'Wordmark logo',
      type: 'image',
      description:
        'White model wordmark on a transparent background, SVG preferred. Shown at the top of the homepage model card; the model name is used when empty.',
      options: {accept: 'image/svg+xml,image/png,image/webp'},
    }),
    defineField({
      name: 'specs',
      title: 'Headline specs',
      type: 'array',
      group: ['card', 'detail'],
      fieldset: 'specsCard',
      description: 'Up to three. The numbers roll up when the card scrolls into view.',
      of: [
        defineArrayMember({
          type: 'object',
          name: 'spec',
          fields: [
            defineField({
              name: 'value',
              title: 'Value shown on the card',
              type: 'localeString',
              description:
                'The number and its unit only, e.g. 400 PS or 3.9s. Put context such as "0-100 km/h" in the label.',
            }),
            defineField({
              name: 'label',
              title: 'What it measures',
              type: 'localeString',
              description: 'Shown under the value, e.g. Power or 0-100 km/h.',
            }),
          ],
          preview: {select: {title: 'value.en', subtitle: 'label.en'}},
        }),
      ],
      validation: (rule) => rule.max(3).warning('Only the first few fit on the card.'),
    }),
    defineField({name: 'discoverLink', title: '"Discover" link', type: 'link'}),
    defineField({name: 'testDriveLink', title: '"Test drive" link', type: 'link'}),
  ],
  preview: {select: {title: 'name.en', subtitle: 'tagline.en', media: 'image'}},
})

export const offer = defineType({
  name: 'offer',
  title: 'Offer',
  type: 'document',
  icon: TagIcon,
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule) => rule.custom(requireEnglish('English title is required.')),
    }),
    defineField({
      name: 'subtitle',
      title: 'Subtitle',
      type: 'localeString',
      description: 'Usually validity or a short qualifier.',
    }),
    defineField({name: 'image', title: 'Image', type: 'figure'}),
    defineField({name: 'link', title: 'Link', type: 'link'}),
  ],
  preview: {select: {title: 'title.en', subtitle: 'subtitle.en', media: 'image'}},
})

export const serviceFeature = defineType({
  name: 'serviceFeature',
  title: 'Service feature',
  type: 'document',
  icon: WrenchIcon,
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon',
      type: 'string',
      description: 'Matches an icon in the website icon map.',
      options: {
        list: [
          {title: 'Shield', value: 'shield'},
          {title: 'Gears', value: 'gears'},
          {title: 'Charging plug', value: 'plug'},
          {title: 'Bolt', value: 'bolt'},
          {title: 'Wrench', value: 'wrench'},
          {title: 'Star', value: 'star'},
          {title: 'Car', value: 'car'},
          {title: 'Headset', value: 'headset'},
        ],
      },
      initialValue: 'shield',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'localeString',
      validation: (rule) => rule.custom(requireEnglish('English title is required.')),
    }),
    defineField({name: 'description', title: 'Description', type: 'localeText'}),
  ],
  preview: {select: {title: 'title.en', subtitle: 'icon'}},
})

export const showroom = defineType({
  name: 'showroom',
  title: 'Showroom',
  type: 'document',
  icon: PinIcon,
  groups: [
    {name: 'details', title: 'Details', default: true},
    {name: 'labels', title: 'Field labels'},
    {name: 'status', title: 'Live status'},
  ],
  fields: [
    defineField({
      name: 'name',
      title: 'Showroom name',
      type: 'localeString',
      group: 'details',
      validation: (rule) => rule.custom(requireEnglish('English name is required.')),
    }),
    defineField({
      name: 'image',
      title: 'Photo',
      type: 'figure',
      group: 'details',
      description: 'Shown on the showroom tile in the test-drive form.',
    }),
    defineField({name: 'address', title: 'Address', type: 'localeText', group: 'details'}),
    defineField({
      name: 'hours',
      title: 'Opening hours',
      type: 'localeText',
      group: 'details',
      description: 'Line breaks are preserved on the site.',
    }),
    defineField({
      name: 'contactText',
      title: 'Contact text',
      type: 'localeString',
      group: 'details',
      description: 'e.g. WhatsApp • +971 4 123 4567',
    }),
    defineField({name: 'contactHref', title: 'Contact link', type: 'string', group: 'details'}),
    defineField({
      name: 'directionsLinkText',
      title: 'Directions link text',
      type: 'localeString',
      group: 'details',
    }),
    defineField({name: 'directionsHref', title: 'Directions URL', type: 'url', group: 'details'}),
    defineField({
      name: 'locationLabel',
      title: '"Location" label',
      type: 'localeString',
      group: 'labels',
    }),
    defineField({
      name: 'hoursLabel',
      title: '"Opening hours" label',
      type: 'localeString',
      group: 'labels',
    }),
    defineField({
      name: 'contactLabel',
      title: '"Contact" label',
      type: 'localeString',
      group: 'labels',
    }),
    defineField({
      name: 'directionsLabel',
      title: '"Directions" label',
      type: 'localeString',
      group: 'labels',
    }),
    defineField({
      name: 'liveStatusLabel',
      title: '"Live status" label',
      type: 'localeString',
      group: 'status',
    }),
    defineField({name: 'openLabel', title: 'Open text', type: 'localeString', group: 'status'}),
    defineField({name: 'closedLabel', title: 'Closed text', type: 'localeString', group: 'status'}),
    defineField({
      name: 'isOpen',
      title: 'Currently open',
      type: 'boolean',
      group: 'status',
      initialValue: true,
      description: 'Toggle and publish to flip the badge on the live site instantly.',
    }),
  ],
  preview: {select: {title: 'name.en', subtitle: 'address.en'}},
})

/** Written by the website's /api/test-drive function; read-only in the Studio. */
export const testDriveEnquiry = defineType({
  name: 'testDriveEnquiry',
  title: 'Test drive enquiry',
  type: 'document',
  icon: EnvelopeIcon,
  readOnly: true,
  fields: [
    defineField({name: 'fullName', title: 'Full name', type: 'string'}),
    defineField({name: 'email', title: 'Email', type: 'string'}),
    defineField({name: 'phone', title: 'Phone', type: 'string'}),
    defineField({name: 'model', title: 'Model of interest', type: 'string'}),
    defineField({name: 'location', title: 'Preferred location', type: 'string'}),
    defineField({name: 'preferredDate', title: 'Preferred date', type: 'string'}),
    defineField({name: 'message', title: 'Message', type: 'text', rows: 4}),
    defineField({name: 'country', title: 'Country', type: 'string'}),
    defineField({name: 'marketingConsent', title: 'Agreed to marketing', type: 'boolean'}),
    defineField({name: 'locale', title: 'Submitted in language', type: 'string'}),
    defineField({name: 'submittedAt', title: 'Submitted at', type: 'datetime'}),
  ],
  orderings: [
    {name: 'newest', title: 'Newest first', by: [{field: 'submittedAt', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'fullName', model: 'model', at: 'submittedAt'},
    prepare: ({title, model, at}) => ({
      title: title || 'Enquiry',
      subtitle: [model, at ? new Date(at).toLocaleString() : null].filter(Boolean).join(' • '),
    }),
  },
})
