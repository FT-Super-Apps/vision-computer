import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { id } = params
    const body = await request.json()
    const { name, price, validityDays, features, isActive } = body

    // Validate required fields
    if (!name || price === undefined || validityDays === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: name, price, validityDays' },
        { status: 400 }
      )
    }

    // Check if package exists
    const existingPackage = await prisma.package.findUnique({
      where: { id },
    })

    if (!existingPackage) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    // Update the package
    const updatedPackage = await prisma.package.update({
      where: { id },
      data: {
        name,
        price: parseInt(price),
        validityDays: parseInt(validityDays),
        features: features || existingPackage.features,
        isActive: isActive !== undefined ? isActive : existingPackage.isActive,
      },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Package updated successfully',
      data: { package: updatedPackage },
    })
  } catch (error: any) {
    console.error('[ADMIN_PACKAGE_UPDATE_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to update package', details: error.message },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      )
    }

    const { id } = params

    // Check if package has active subscriptions
    const packageWithSubscriptions = await prisma.package.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            subscriptions: true,
          },
        },
      },
    })

    if (!packageWithSubscriptions) {
      return NextResponse.json(
        { error: 'Package not found' },
        { status: 404 }
      )
    }

    if (packageWithSubscriptions._count.subscriptions > 0) {
      return NextResponse.json(
        { error: 'Cannot delete package with active subscriptions. Deactivate it instead.' },
        { status: 400 }
      )
    }

    // Delete the package
    await prisma.package.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Package deleted successfully',
    })
  } catch (error: any) {
    console.error('[ADMIN_PACKAGE_DELETE_ERROR]', error)
    return NextResponse.json(
      { error: 'Failed to delete package', details: error.message },
      { status: 500 }
    )
  }
}
