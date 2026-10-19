import {CalendarIcon} from '@sanity/icons/Calendar'
import {CogIcon} from '@sanity/icons/Cog'
import {DocumentIcon} from '@sanity/icons/Document'
import {EnvelopeIcon} from '@sanity/icons/Envelope'
import {HomeIcon} from '@sanity/icons/Home'
import {MenuIcon} from '@sanity/icons/Menu'
import {PinIcon} from '@sanity/icons/Pin'
import {TagIcon} from '@sanity/icons/Tag'
import {ThLargeIcon} from '@sanity/icons/ThLarge'
import {WrenchIcon} from '@sanity/icons/Wrench'
import type {StructureResolver} from 'sanity/structure'
import {EnquiriesTable} from './components/EnquiriesTable'

/** Sidebar layout. Singletons open straight into their one document. */
export const structure: StructureResolver = (S) => {
  const singleton = (type: string, title: string, icon: typeof HomeIcon) =>
    S.listItem().title(title).icon(icon).child(S.document().schemaType(type).documentId(type))

  const list = (type: string, title: string, icon: typeof HomeIcon) =>
    S.listItem().title(title).icon(icon).child(S.documentTypeList(type).title(title))

  return S.list()
    .title('Lotus UAE')
    .items([
      singleton('homePage', 'Home page', HomeIcon),
      S.divider(),
      list('vehicle', 'Vehicles', DocumentIcon),
      list('offer', 'Offers', TagIcon),
      list('serviceFeature', 'Service features', WrenchIcon),
      list('showroom', 'Showrooms', PinIcon),
      singleton('testDrivePage', 'Test drive page', CalendarIcon),
      S.listItem()
        .title('Test drive enquiries')
        .icon(EnvelopeIcon)
        .child(
          S.documentTypeList('testDriveEnquiry')
            .title('Test drive enquiries')
            .defaultOrdering([{field: 'submittedAt', direction: 'desc'}])
            .child((id) => S.document().documentId(id).schemaType('testDriveEnquiry')),
        ),
      S.listItem()
        .title('Enquiries table')
        .icon(EnvelopeIcon)
        .child(S.component(EnquiriesTable).title('Test drive enquiries')),
      S.divider(),
      singleton('navigation', 'Navigation', MenuIcon),
      singleton('footer', 'Footer', ThLargeIcon),
      singleton('siteSettings', 'Site settings', CogIcon),
    ])
}
