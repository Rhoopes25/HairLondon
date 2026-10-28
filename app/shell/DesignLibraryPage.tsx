import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDocumentTitle } from '@app/hooks/usePageBehavior';
import {
  Avatar,
  BackLink,
  BookBar,
  Button,
  Chip,
  ChipRow,
  ConfirmBar,
  ConfirmDialog,
  Container,
  EmptyNote,
  Hero,
  Icon,
  LinkButton,
  Modal,
  NavBar,
  Narrow,
  Notice,
  PageIntro,
  PortfolioGrid,
  ProfileHeader,
  QuietLink,
  RatingLine,
  MapCard,
  Recap,
  Reviews,
  Section,
  ServiceOption,
  ServiceRow,
  ServiceSummary,
  Sheet,
  SlotPicker,
  SplitLayout,
  StarInput,
  Stars,
  StepGuide,
  StylistCard,
  TabRow,
  Tabs,
  TextAreaField,
  TextButton,
  TextField,
} from '@app/ui';
import type { IconName } from '@app/ui';
import { assetUrl } from '@app/config';
import { formatStartingPrice } from '@src/domain/format/price';
import styles from './DesignLibraryPage.module.css';

const ICONS: IconName[] = [
  'scissors',
  'close',
  'check',
  'chevron-right',
  'chevron-left',
  'heart',
  'calendar',
  'clock',
  'map-pin',
  'info',
];

function Specimen({ name, children }: { name: string; children: ReactNode }) {
  return (
    <section className={styles.specimen}>
      <h2>{name}</h2>
      <div className={styles.stage}>{children}</div>
    </section>
  );
}

/**
 * Every component in the design library, in one place, so reviewers can see that screens
 * are assembled from a shared set of parts. Not linked from the app.
 */
export function DesignLibraryPage() {
  useDocumentTitle('Design library');
  const [chip, setChip] = useState(true);
  const [service, setService] = useState(true);
  const [changing, setChanging] = useState(false);
  const [tab, setTab] = useState('services');
  const [day, setDay] = useState<string | null>('2026-10-16');
  const [time, setTime] = useState<number | null>(780);
  const [stars, setStars] = useState(4);
  const [open, setOpen] = useState<'modal' | 'sheet' | 'confirm' | null>(null);

  return (
    <>
      <BackLink to="/">Home</BackLink>
      <PageIntro title="Design library">
        The reusable parts every screen is built from, using the tokens in the design system.
      </PageIntro>

      <div className={styles.page}>
        <Specimen name="Icon">
          <div className={styles.row}>
            {ICONS.map((name) => (
              <span key={name} className={styles.icon} title={name}>
                <Icon name={name} />
              </span>
            ))}
          </div>
        </Specimen>

        <Specimen name="Button">
          <div className={styles.column}>
            <Button>Primary</Button>
            <Button variant="outline">Outline</Button>
            <Button disabled>Disabled</Button>
            <Button size="sm">Small</Button>
            <LinkButton to="/stylists">Link styled as a button</LinkButton>
            <TextButton>Quiet text button</TextButton>
            <QuietLink to="/">Quiet link</QuietLink>
          </div>
        </Specimen>

        <Specimen name="NavBar">
          <NavBar
            label="Example navigation"
            homeTo="/"
            links={[
              { to: '/design-library', label: 'Library', end: true },
              { to: '/book', label: 'Book' },
              { to: '/stylists', label: 'Stylists' },
            ]}
          />
        </Specimen>

        <Specimen name="Hero">
          <Hero
            imageUrl={assetUrl('images/home.jpg')}
            imageLabel="A stylist holding her shears"
            title="Local Locks"
            tagline="Local stylists you can trust."
            actions={[
              { label: 'Explore Stylists', to: '/stylists' },
              { label: 'Book Now', to: '/book', variant: 'outline' },
            ]}
          />
        </Specimen>

        <Specimen name="ProfileHeader, TabRow">
          <ProfileHeader
            name="London"
            photoUrl={assetUrl('images/home.jpg')}
            studio="Hair by London"
            city="Provo"
            average={4.7}
            reviewCount={3}
            bio="Lived-in blondes, soft color, and cuts that grow out well."
          >
            <TabRow>
              <span>Tabs go here</span>
            </TabRow>
          </ProfileHeader>
        </Specimen>

        <Specimen name="Avatar, Stars, RatingLine">
          <div className={styles.row}>
            <Avatar name="Sadie Morgan" />
            <Avatar name="London" photoUrl={assetUrl('images/home.jpg')} />
            <Avatar name="Kai Nakamura" size="sm" />
          </div>
          <Stars stars={5} />
          <RatingLine average={4.67} count={3} />
          <RatingLine average={null} count={0} />
        </Specimen>

        <Specimen name="Chip">
          <ChipRow label="Example filters" wrap>
            <Chip selected={chip} onClick={() => setChip(true)}>
              Selected
            </Chip>
            <Chip selected={!chip} onClick={() => setChip(false)}>
              Not selected
            </Chip>
          </ChipRow>
        </Specimen>

        <Specimen name="Section (numbered, optional)">
          <Section title="What do you need?" step={1}>
            <p>The one required step is numbered.</p>
          </Section>
          <Section title="Which day?" optional>
            <p>Optional steps sit back.</p>
          </Section>
        </Specimen>

        <Specimen name="Tabs">
          <Tabs value={tab} onValueChange={setTab}>
            <Tabs.List label="Example tabs">
              <Tabs.Tab value="portfolio">Portfolio</Tabs.Tab>
              <Tabs.Tab value="services">Services</Tabs.Tab>
              <Tabs.Tab value="reviews">Reviews</Tabs.Tab>
            </Tabs.List>
            <Tabs.Panel value="portfolio">Photos panel</Tabs.Panel>
            <Tabs.Panel value="services">Services panel</Tabs.Panel>
            <Tabs.Panel value="reviews">Reviews panel</Tabs.Panel>
          </Tabs>
        </Specimen>

        <Specimen name="TextField, TextAreaField, StarInput">
          <div className={styles.column}>
            <TextField label="Name" hint="As you would like us to call you." />
            <TextField label="Phone" error="Enter a 10-digit phone number." defaultValue="555" />
            <TextAreaField label="Tell others about it" rows={2} />
            <StarInput legend="How was your visit?" value={stars} onChange={setStars} />
          </div>
        </Specimen>

        <Specimen name="ServiceOption, ServiceRow">
          <div className={styles.column}>
            <ServiceOption
              name="Haircut"
              description="Wash, cut, and style."
              meta={`1 hr · ${formatStartingPrice(65)}`}
              checked={service}
              onChange={setService}
            />
            <ServiceSummary
              names="Haircut + Color"
              meta="$185+ · about 3 hr"
              expanded={changing}
              onToggle={() => setChanging(!changing)}
              controls="library-service-list"
            />
            <ServiceRow
              to="/stylists"
              name="Color"
              description="All-over color."
              meta="2 hr · $120+"
              onInfo={() => undefined}
            />
          </div>
        </Specimen>

        <Specimen name="SlotPicker">
          <SlotPicker.Days
            days={[
              { id: '2026-10-14', weekday: 'Wed', dayNum: 14, month: 'Oct', label: 'Wed, Oct 14' },
              { id: '2026-10-16', weekday: 'Fri', dayNum: 16, month: 'Oct', label: 'Fri, Oct 16' },
            ]}
            selectedId={day}
            onSelect={setDay}
            any={{ selected: day === null, onSelect: () => setDay(null) }}
          />
          <SlotPicker.Times
            times={[
              { id: 540, label: '9:00 AM', available: true },
              { id: 570, label: '9:30 AM', available: false },
              { id: 780, label: '1:00 PM', available: true },
            ]}
            selectedId={time}
            onSelect={setTime}
          />
        </Specimen>

        <Specimen name="StylistCard">
          <StylistCard
            to="/stylists/london"
            name="London"
            photoUrl={assetUrl('images/home.jpg')}
            studio="Hair by London"
            city="Provo"
            average={4.7}
            reviewCount={3}
            distance="2.1 mi away"
            price={{ value: '$35+' }}
            photos={[
              { src: assetUrl('images/work-1.jpg') },
              { src: assetUrl('images/work-3.jpg') },
            ]}
            seeAll={{ to: '/stylists/london', label: 'See all of London’s work' }}
            slots={{
              heading: 'Next open',
              items: [
                {
                  label: 'Today, 1:00 PM',
                  to: '/book/london',
                  ariaLabel: 'Book London, today at 1:00 PM',
                },
                {
                  label: 'Tomorrow, 9:30 AM',
                  to: '/book/london',
                  ariaLabel: 'Book London, tomorrow at 9:30 AM',
                },
              ],
            }}
          />
        </Specimen>

        <Specimen name="BookBar, Notice">
          <BookBar
            title="Haircut + Color"
            meta="$185+ · about 3 hr"
            heldTime="Fri, Oct 16 at 1:00 PM"
            to="/book/london"
            label="Book with London"
          />
          <Notice title="No openings Sat, Oct 17 in the morning">
            Nobody has a long enough opening then. Here are the soonest times they do have.
          </Notice>
        </Specimen>

        <Specimen name="PortfolioGrid">
          <PortfolioGrid
            photos={[
              { src: assetUrl('images/work-1.jpg'), alt: 'Platinum balayage' },
              { src: assetUrl('images/work-3.jpg'), alt: 'Ash blonde balayage' },
            ]}
          />
        </Specimen>

        <Specimen name="Reviews">
          <Reviews
            average={4.5}
            reviews={[
              { id: '1', name: 'Maren T.', stars: 5, text: 'Finally found someone I trust.' },
              { id: '2', name: 'Elise K.', stars: 4, text: 'Relaxed, no pressure.' },
            ]}
          />
        </Specimen>

        <Specimen name="StepGuide">
          <StepGuide
            label="Booking progress"
            current={1}
            steps={[
              { label: 'Pick a time', icon: 'calendar' },
              { label: 'Your details', icon: 'user' },
              { label: 'Review', icon: 'list' },
              { label: 'Booked', icon: 'check' },
            ]}
          />
        </Specimen>

        <Specimen name="MapCard">
          <MapCard
            address="184 N University Ave, Provo, UT"
            directionsUrl="https://www.google.com/maps/dir/?api=1&destination=Provo%2C%20UT"
            distance="2.1 mi away"
          />
        </Specimen>

        <Specimen name="Recap, ConfirmBar">
          <Recap
            rows={[
              { label: 'Stylist', icon: 'scissors', value: 'London' },
              { label: 'When', icon: 'calendar', value: 'Fri, Oct 16, 10:00 to 11:00 AM' },
              { label: 'Estimated total', icon: 'clock', value: '$65+, about 1 hr' },
            ]}
          />
          <ConfirmBar
            progress={{ label: 'Choose a time', percent: 67 }}
            summary="Haircut · Fri, Oct 16"
            total={{ label: 'Estimated total', value: '$65+ · about 1 hr' }}
            note="Starting price. Longer or thicker hair can cost more."
          >
            <Button fullWidth>Continue</Button>
          </ConfirmBar>
        </Specimen>

        <Specimen name="Container, Narrow, SplitLayout">
          <Container>
            <p className={styles.box}>Container: the page column, up to 1200px, centered.</p>
            <Narrow>
              <p className={styles.box}>Narrow: forms and confirmations, up to 640px.</p>
            </Narrow>
            <SplitLayout aside={<p className={styles.box}>Panel (sticky on desktop)</p>}>
              <p className={styles.box}>
                SplitLayout: choices, with the panel beside them from 900px.
              </p>
            </SplitLayout>
          </Container>
        </Specimen>

        <Specimen name="EmptyNote">
          <EmptyNote>Nothing here yet.</EmptyNote>
        </Specimen>

        <Specimen name="Modal, Sheet, ConfirmDialog">
          <div className={styles.row}>
            <Button variant="outline" size="sm" onClick={() => setOpen('modal')}>
              Modal
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpen('sheet')}>
              Sheet
            </Button>
            <Button variant="outline" size="sm" onClick={() => setOpen('confirm')}>
              Confirm
            </Button>
          </div>
        </Specimen>
      </div>

      <Modal open={open === 'modal'} onClose={() => setOpen(null)} title="A dialog">
        <p>Centered, labelled, closes on Escape.</p>
      </Modal>
      <Sheet open={open === 'sheet'} onClose={() => setOpen(null)} title="A sheet">
        <p>Rises from the bottom edge.</p>
      </Sheet>
      <ConfirmDialog
        open={open === 'confirm'}
        title="Are you sure?"
        message="The quiet option is the safe one."
        confirmLabel="Yes"
        cancelLabel="No, go back"
        onConfirm={() => setOpen(null)}
        onCancel={() => setOpen(null)}
      />
    </>
  );
}
