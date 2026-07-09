import { Link, useLocation } from 'react-router-dom'

export default function ScrollLink({ to, children, className = '', onClick, ...props }) {
  const location = useLocation()
  const [path, hash] = to.includes('#') ? to.split('#') : [to, '']
  const isSamePage = location.pathname === (path || '/')

  const handleClick = (e) => {
    if (hash && isSamePage) {
      e.preventDefault()
      document.getElementById(hash)?.scrollIntoView()
    }
    onClick?.(e)
  }

  return (
    <Link to={to} className={className} onClick={handleClick} {...props}>
      {children}
    </Link>
  )
}
