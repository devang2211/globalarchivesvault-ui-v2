import { type SVGProps } from 'react'
import { CircleCheck, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePreferences } from '@/app/providers/PreferencesProvider'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconDir } from '@/assets/custom/icon-dir'

const DEFAULTS = {
  theme: 'light',
  font: 'inter',
  sidebar: 'default',
  layout: 'default',
  direction: 'ltr',
}

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

/* ---- Radio Option Item ---- */
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
  value,
  label,
  fontFamily,
  checked,
  onSelect,
}: {
  value: string
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

/* ---- Main Component ---- */
export const ThemeSettings = () => {
  const { preferences, updatePreference } = usePreferences()

  return (
    <div className='space-y-6'>

      {/* THEME */}
      <div>
        <SectionTitle
          title='Theme'
          showReset={preferences.theme !== DEFAULTS.theme}
          onReset={() => updatePreference('theme', DEFAULTS.theme)}
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
          showReset={preferences.font !== DEFAULTS.font}
          onReset={() => updatePreference('font', DEFAULTS.font)}
        />
        <div className='grid w-full grid-cols-3 gap-4'>
          {[
            { value: 'inter', label: 'Inter', fontFamily: '"Inter", sans-serif' },
            { value: 'manrope', label: 'Manrope', fontFamily: '"Manrope", sans-serif' },
            { value: 'system', label: 'System', fontFamily: 'system-ui, -apple-system, sans-serif' },
          ].map((item) => (
            <FontOptionItem
              key={item.value}
              value={item.value}
              label={item.label}
              fontFamily={item.fontFamily}
              checked={preferences.font === item.value}
              onSelect={() => updatePreference('font', item.value)}
            />
          ))}
        </div>
      </div>

      {/* DIRECTION */}
      <div>
        <SectionTitle
          title='Direction'
          showReset={preferences.direction !== DEFAULTS.direction}
          onReset={() => updatePreference('direction', DEFAULTS.direction)}
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
