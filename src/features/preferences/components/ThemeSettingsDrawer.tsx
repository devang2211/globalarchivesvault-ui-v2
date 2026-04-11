import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { usePreferences } from '@/app/providers/PreferencesProvider'
import { ThemeSettings } from './ThemeSettings'

type Props = {
  open: boolean
  onOpenChange: (v: boolean) => void
}

export const ThemeSettingsDrawer = ({ open, onOpenChange }: Props) => {
  const { resetPreferences } = usePreferences()

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='flex flex-col gap-0 p-0'>
        <SheetHeader className='border-b border-border px-6 py-5 text-start'>
          <SheetTitle>Theme Settings</SheetTitle>
          <SheetDescription>
            Adjust the appearance and layout to suit your preferences.
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-6 py-6'>
          <ThemeSettings />
        </div>

        <SheetFooter className='border-t border-border px-6 py-4'>
          <Button variant='destructive' className='w-full' onClick={resetPreferences}>
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
