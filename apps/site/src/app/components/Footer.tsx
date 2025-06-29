export default function Footer() {
  return (
    <footer className='border-t border-border py-6 bg-card mt-auto'>
      <div className='container'>
        <div className='flex flex-col md:flex-row items-center justify-center gap-4'>
          <p className='text-sm text-muted-foreground'>&copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  )
}
