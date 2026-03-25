import { Box, Container, Typography } from '@mui/material'
import ImagePolygonOverlay from '@/components/Map/ImagePolygonOverlay'
import fazendinha from '../assets/fazendinha.jpg'

export function ExemploMapaInterativo() {
  return (
    <Box sx={{ py: { xs: 3, md: 6 } }}>
      <Container maxWidth="lg">
        <Box sx={{ mb: 2.5, textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, letterSpacing: -0.6 }}>
            Exemplo: Mapa interativo (SVG overlay)
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75 }}>
            Passe a imagem e uma lista de polígonos (em pixels) para criar áreas clicáveis e com hover.
          </Typography>
        </Box>

        <ImagePolygonOverlay
          imageSrc={fazendinha}
          width="900px"
          defaultStroke="yellow"
          defaultStrokeWidth={2}
          polygons={[
            {
              id: 'lv-branca',
              title: 'Área LV. Branca',
              showLabel: true,
              points: '600,120 950,100 920,450 700,480 620,400 650,300 600,250',
              tooltip: {
                title: 'Área LV. Branca',
                description: 'Descrição da plantação (fictícia). Solo corrigido, irrigação programada e rotação de cultura.',
                metrics: [
                  { label: 'Plantação', value: 'Milho' },
                  { label: 'Área', value: '2.400 m²' },
                  { label: 'Irrigação', value: 'Gotejamento' },
                  { label: 'Previsão de colheita', value: '45 dias' },
                ],
              },
            },
            {
              id: 'sq-topazio',
              title: 'Área SQ Topázio',
              showLabel: true,
              points: '350,180 600,160 600,250 580,300 400,280 320,240',
              tooltip: {
                title: 'Área SQ Topázio',
                description: 'Descrição da plantação (fictícia). Monitoramento de pragas ativo e adubação balanceada.',
                metrics: [
                  { label: 'Plantação', value: 'Soja' },
                  { label: 'Área', value: '1.150 m²' },
                  { label: 'Umidade', value: '68%' },
                  { label: 'Status', value: 'Saudável' },
                ],
              },
            },
            {
              id: 'cn01',
              title: 'Área CN01',
              showLabel: true,
              points: '320,120 580,120 600,160 350,180 300,150',
              tooltip: {
                title: 'Área CN01',
                description: 'Descrição da plantação (fictícia). Área de teste para variedade mais resistente.',
                metrics: [
                  { label: 'Plantação', value: 'Feijão' },
                  { label: 'Área', value: '520 m²' },
                  { label: 'Fase', value: 'Crescimento' },
                ],
              },
            },
            {
              id: 'cn02',
              title: 'Área CN02',
              showLabel: true,
              points: '350,300 580,300 600,350 500,380 320,360',
              tooltip: {
                title: 'Área CN02',
                description: 'Descrição da plantação (fictícia). Aplicação recente de nutrientes e controle de ervas.',
                metrics: [
                  { label: 'Plantação', value: 'Trigo' },
                  { label: 'Área', value: '780 m²' },
                  { label: 'pH do solo', value: '6,2' },
                ],
              },
            },
            {
              id: 'ce',
              title: 'Área CE',
              showLabel: true,
              points: '200,280 320,240 350,300 320,360 200,340',
              tooltip: {
                title: 'Área CE',
                description: 'Descrição da plantação (fictícia). Reservado para expansão e manejo do solo.',
                metrics: [
                  { label: 'Plantação', value: 'Cana' },
                  { label: 'Área', value: '460 m²' },
                  { label: 'Rega', value: 'Manual' },
                ],
              },
            },
            {
              id: 'ed02',
              title: 'Área ED02',
              showLabel: true,
              points: '100,260 200,280 200,340 120,320',
              tooltip: {
                title: 'Área ED02',
                description: 'Descrição da plantação (fictícia). Área próxima ao galpão, fácil acesso para manutenção.',
                metrics: [
                  { label: 'Plantação', value: 'Hortaliças' },
                  { label: 'Área', value: '210 m²' },
                  { label: 'Revisão', value: 'Semanal' },
                ],
              },
            },
            {
              id: 'inferior',
              title: 'Área inferior',
              showLabel: true,
              points: '250,380 500,380 600,350 650,400 500,450 300,440 200,400',
              tooltip: {
                title: 'Área inferior',
                description: 'Descrição da plantação (fictícia). Área de maior produção e escoamento.',
                metrics: [
                  { label: 'Plantação', value: 'Sorgo' },
                  { label: 'Área', value: '1.980 m²' },
                  { label: 'Produtividade', value: 'Alta' },
                ],
              },
            },
          ]}
          onPolygonClick={(id) => console.log('clicou', id)}
        />
      </Container>
    </Box>
  )
}

