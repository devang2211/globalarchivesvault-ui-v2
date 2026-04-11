import { type SVGProps } from 'react'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePreferences, defaultPreferences } from '@/app/providers/PreferencesProvider'
import { SidebarPreview, LayoutPreview } from '@/components/ui/preview-blocks'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconDir } from '@/assets/custom/icon-dir'

/* ---- Section Title ---- */
function SectionTitle({
  title,
  showReset,
  onReset,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
}) {
  return (
    <div className='mb-2 flex items-center gap-2 text-sm font-semibold text-muted-foreground'>
      {title}
      {showReset && onReset && (
        <button
          type='button'
          onClick={onReset}
          className='flex size-4 cursor-pointer items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-muted/80'
        >
          <RotateCcw className='size-3' />
        </button>
      )}
    </div>
  )
}

/* ---- Radio Option Item (SVG icon variant) ---- */
function RadioOptionItem({
  label,
  checked,
  onSelect,
  icon: Icon,
  isTheme = false,
}: {
  label: string
  checked: boolean
  onSelect: () => void
  icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  isTheme?: boolean
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className='cursor-pointer outline-none transition duration-200 ease-in'
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px]',
          checked ? 'shadow-2xl ring-primary' : 'ring-border'
        )}
      >
        <CircleCheck
          className={cn(
            'absolute right-0 top-0 size-6 -translate-y-1/2 translate-x-1/2 fill-primary stroke-white',
            !checked && 'hidden'
          )}
        />
        <Icon
          className={cn(
            !isTheme &&
              (checked
                ? 'fill-primary stroke-primary'
                : 'fill-muted-foreground stroke-muted-foreground')
          )}
        />
      </div>
      <div className='mt-1 text-xs'>{label}</div>
    </button>
  )
}

/* ---- Font Option Item ---- */
function FontOptionItem({
  label,
  fontFamily,
  checked,
  onSelect,
}: {
  label: string
  fontFamily: string
  checked: boolean
  onSelect: () => void
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className='cursor-pointer outline-none transition duration-200 ease-in'
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px]',
          checked ? 'shadow-2xl ring-primary' : 'ring-border'
        )}
      >
        <CircleCheck
          className={cn(
            'absolute right-0 top-0 size-6 -translate-y-1/2 translate-x-1/2 fill-primary stroke-white',
            !checked && 'hidden'
          )}
        />
        <div
          className='flex h-[51px] w-full items-center justify-center overflow-hidden rounded-[6px] bg-muted'
          style={{ fontFamily }}
        >
          <span className='text-xl font-semibold'>Ag</span>
        </div>
      </div>
      <div className='mt-1 text-xs'>{label}</div>
    </button>
  )
}

/* ---- Preview Option Item (preview-block children variant) ---- */
function PreviewOptionItem({
  label,
  checked,
  onSelect,
  children,
}: {
  label: string
  checked: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type='button'
      onClick={onSelect}
      className='w-full cursor-pointer outline-none transition duration-200 ease-in'
    >
      <div
        className={cn(
          'relative rounded-[6px] ring-[1px]',
          checked ? 'shadow-2xl ring-primary' : 'ring-border'
        )}
      >
        <CircleCheck
          className={cn(
            'absolute right-0 top-0 size-6 -translate-y-1/2 translate-x-1/2 fill-primary stroke-white',
            !checked && 'hidden'
          )}
        />
        {children}
      </div>
      <div className='mt-1 text-xs'>{label}</div>
    </button>
  )
}

/* ---- Main Component ---- */
export const ThemeSettings = () => {
  const { preferences, updatePreference } = usePreferences()

  return (
    <div className='space-y-6'>

      {/* THEME */}
      <div>
        <SectionTitle
          title='Theme'
          showReset={preferences.theme !== defaultPreferences.theme}
          onReset={() => updatePreference('theme', defaultPreferences.theme)}
        />
        <div className='grid w-full grid-cols-3 gap-4'>
          {[
            { value: 'system', label: 'System', icon: IconThemeSystem },
            { value: 'light', label: 'Light', icon: IconThemeLight },
            { value: 'dark', label: 'Dark', icon: IconThemeDark },
          ].map((item) => (
            <RadioOptionItem
              key={item.value}
              label={item.label}
              icon={item.icon}
              checked={preferences.theme === item.value}
              onSelect={() => updatePreference('theme', item.value)}
              isTheme
            />
          ))}
        </div>
      </div>

      {/* FONT */}
      <div>
        <SectionTitle
          title='Font'
          showReset={preferences.font !== defaultPreferences.font}
          onReset={() => updatePreference('font', defaultPreferences.font)}
        />
        <div className='grid w-full grid-cols-3 gap-4'>
          {[
            { value: 'inter', label: 'Inter', fontFamily: '"Inter", sans-serif' },
            { value: 'manrope', label: 'Manrope', fontFamily: '"Manrope", sans-serif' },
            { value: 'system', label: 'System', fontFamily: 'system-ui, -apple-system, sans-serif' },
          ].map((item) => (
            <FontOptionItem
              key={item.value}
              label={item.label}
              fontFamily={item.fontFamily}
              checked={preferences.font === item.value}
              onSelect={() => updatePreference('font', item.value)}
            />
          ))}
        </div>
      </div>

      {/* SIDEBAR */}
      {/* <div>
        <SectionTitle
          title='Sidebar'
          showReset={preferences.sidebar !== defaultPreferences.sidebar}
          onReset={() => updatePreference('sidebar', defaultPreferences.sidebar)}
        />
        <div className='grid w-full grid-cols-3 gap-4'>
          {[
            { value: 'default', label: 'Default' },
            { value: 'inset', label: 'Inset' },
            { value: 'floating', label: 'Floating' },
          ].map((item) => (
            <PreviewOptionItem
              key={item.value}
              label={item.label}
              checked={preferences.sidebar === item.value}
              onSelect={() => updatePreference('sidebar', item.value)}
            >
              <SidebarPreview type={item.value} />
            </PreviewOptionItem>
          ))}
        </div>
      </div> */}

      {/* LAYOUT */}
      {/* <div>
        <SectionTitle
          title='Layout'
          showReset={preferences.layout !== defaultPreferences.layout}
          onReset={() => updatePreference('layout', defaultPreferences.layout)}
        />
        <div className='grid w-full grid-cols-3 gap-4'>
          {[
            { value: 'default', label: 'Default' },
            { value: 'compact', label: 'Compact' },
            { value: 'full', label: 'Full' },
          ].map((item) => (
            <PreviewOptionItem
              key={item.value}
              label={item.label}
              checked={preferences.layout === item.value}
              onSelect={() => updatePreference('layout', item.value)}
            >
              <LayoutPreview type={item.value} />
            </PreviewOptionItem>
          ))}
        </div>
      </div> */}

      {/* DIRECTION */}
      <div>
        <SectionTitle
          title='Direction'
          showReset={preferences.direction !== defaultPreferences.direction}
          onReset={() => updatePreference('direction', defaultPreferences.direction)}
        />
        <div className='grid w-full grid-cols-3 gap-4'>
          {[
            {
              value: 'ltr',
              label: 'Left to Right',
              icon: (props: SVGProps<SVGSVGElement>) => <IconDir dir='ltr' {...props} />,
            },
            {
              value: 'rtl',
              label: 'Right to Left',
              icon: (props: SVGProps<SVGSVGElement>) => <IconDir dir='rtl' {...props} />,
            },
          ].map((item) => (
            <RadioOptionItem
              key={item.value}
              label={item.label}
              icon={item.icon}
              checked={preferences.direction === item.value}
              onSelect={() => updatePreference('direction', item.value)}
            />
          ))}
        </div>
      </div>

    </div>
  )
}
