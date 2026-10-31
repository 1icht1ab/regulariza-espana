import { Link } from 'react-router-dom'
import { Card } from '../components/ui'

export default function NoEncontrado() {
  return (
    <Card>
      <p className="font-bold">Esta página no existe.</p>
      <Link to="/" className="text-sm text-blue-700 underline">Volver al inicio</Link>
    </Card>
  )
}
