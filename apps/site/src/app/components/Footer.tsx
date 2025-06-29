export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className='bg-gray-900 text-white py-12'>
      <div className='container mx-auto px-4'>
        <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
          <p>&copy; {currentYear}</p>
        </div>
      </div>
    </footer>
  )
}
