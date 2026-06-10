import InstagramIcon from '@/assets/svg/instagram-icon'
import ThreadsIcon from '@/assets/svg/threads-icon'

export function AppFooter() {
  return (
    <div className='text-muted-foreground flex w-full items-center justify-center gap-3 px-3 py-2'>
      <p className='text-sm text-balance text-center'>
        {`©${new Date().getFullYear()} Sales Dashboard`}
      </p>
    </div>
  )
}
